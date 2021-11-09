import { Socket } from 'socket.io';

import { WSGuard } from '../modules/ws-guard';
import { WebSocket } from '../websocket';
import { WSEvent, } from './ws-event';
import Channels from '../../data/channels';
import { WS } from '../../types/ws';
import ChannelLeave from './channel-leave';
import { User } from '../../data/models/user';
import { Channel, ChannelDocument } from '../../data/models/channel';

export default class implements WSEvent<'CHANNEL_DELETE'> {
  on = 'CHANNEL_DELETE' as const;

  constructor(
    private channels = deps.channels,
    private guard = deps.wsGuard,
    private channelLeaveEvent = deps.channelLeave,
  ) {}

  public async invoke(ws: WebSocket, client: Socket, { channelId }: WS.Params.ChannelDelete) {
    const channel = await this.channels.getText(channelId);
    await this.guard.validateCan(client, channel.guildId, 'MANAGE_CHANNELS');
    
    // clean up the message
    await User.updateMany(
      { voice: { channelId } },
      { voice: {} },
    );
    ws.io.sockets.in(channelId).socketsLeave(channelId);

    await channel.deleteOne();
    // TODO: testme
    await this.lowerHigherChannels(channel);

    ws.io
      .to(channel.guildId)
      .emit('CHANNEL_DELETE', {
        channelId,
        guildId: channel.guildId,
      } as WS.Args.ChannelDelete);
  }
  
  private async lowerHigherChannels(channel: ChannelDocument) {
    const channels = await Channel.find({
      guildId: channel.guildId,
      position: { $gt: channel.position },
    });
    for (const channel of channels) {
      channel.position++;
      await channel.save();
    }
  }
}
