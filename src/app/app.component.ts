import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  IElementMovementMessage,
  IRegisterClientMessage,
  MessageType,
} from './messages';
import Socket from './Socket';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('movableBox') public movableBox!: ElementRef<HTMLDivElement>;
  private readonly consumer;
  private readonly producer;
  public clientId: string;
  public isWebSocketConnectionOpen = false;
  public isPressed = false;
  public constructor(private httpClient: HttpClient) {
    this.clientId = crypto.randomUUID();
    this.consumer = new Socket('ws://localhost:4040/consumer');
    this.producer = new Socket('ws://localhost:5000/producer');
    const initClientMsg: IRegisterClientMessage = {
      type: MessageType.RegisterClient,
      clientId: this.clientId,
    };
    this.consumer.send(initClientMsg);
  }

  public ngAfterViewInit(): void {
    this.movableBox.nativeElement.style.left = '0px';
    this.movableBox.nativeElement.style.top = '0px';
  }

  public onMouseDown(e: MouseEvent) {
    this.isPressed = true;
    this.lastMousePosition = {
      x: e.screenX,
      y: e.screenY,
    };
  }

  public onMouseUp() {
    this.isPressed = false;
  }

  private lastMousePosition: {
    x: number;
    y: number;
  } = {
    x: 0,
    y: 0,
  };

  private boxPosition = {
    x: 0,
    y: 0,
  };

  public onMouseMove(e: MouseEvent) {
    if (!this.isPressed) {
      return;
    }
    if (!this.movableBox) {
      console.error(
        'Weird behavior. mousemove event is received, but no movable box is found'
      );
      return;
    }

    const diffX = e.screenX - this.lastMousePosition.x;
    const diffY = e.screenY - this.lastMousePosition.y;

    this.boxPosition.x += diffX;
    this.boxPosition.y += diffY;

    const msg: IElementMovementMessage = {
      type: MessageType.ElementMovement,
      clientId: this.clientId,
      x: this.boxPosition.x,
      y: this.boxPosition.y,
    };

    this.producer.send(msg);

    this.lastMousePosition = {
      x: e.screenX,
      y: e.screenY,
    };

    this.movableBox.nativeElement.style.left = `${this.boxPosition.x}px`;
    this.movableBox.nativeElement.style.top = `${this.boxPosition.y}px`;
  }
}
