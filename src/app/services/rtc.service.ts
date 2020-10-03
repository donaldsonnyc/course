import { Injectable } from '@angular/core';
import Peer from 'peerjs';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class RtcService {
  private _peer: Peer;
  get peer() {
    return this._peer;
  }

  constructor(private userService: UsersService) {}

  async init() {
    await this.userService.init();
    if (!this.userService.user) return;
    
    this._peer = new Peer(this.userService.user.id);
  }
}
