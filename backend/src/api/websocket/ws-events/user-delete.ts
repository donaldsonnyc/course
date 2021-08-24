import { WSEvent } from './ws-event';
import { Socket } from 'socket.io';
import { WebSocket } from '../websocket';
import { generateInvite } from '../../../data/models/invite';
import { WS } from '../../../types/ws';
import Users from '../../../data/users';
import Deps from '../../../utils/deps';
import { WSGuard } from '../../modules/ws-guard';

export default class implements WSEvent<'USER_DELETE'> {
  public on = 'USER_DELETE' as const;

  constructor(
    private users = Deps.get<Users>(Users),
    private guard = Deps.get<WSGuard>(WSGuard),
  ) { }

  public async invoke(ws: WebSocket, client: Socket, { token }: WS.Params.UserDelete) {
    const { id: userId } = await this.guard.decodeKey(token);
    const user = await this.users.get(userId);

    const partialUser = {
      discriminator: 0,
      locked: true,
      username: `Deleted User ${generateInvite(6)}`,
    };
    await user.updateOne(partialUser);

    client.emit('USER_DELETE');
    ws.io.emit('USER_UPDATE', { userId: user.id, partialUser } as WS.Args.UserUpdate);
    client.disconnect();
  }
}