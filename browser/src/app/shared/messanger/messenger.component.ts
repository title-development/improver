import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MessengerDocument } from '../../api/models/MessengerDocument';
import { Message } from '@stomp/stompjs';
import { SecurityService } from '../../auth/security.service';
import { ProjectRequestService } from '../../api/services/project-request.service';
import { CompanyService } from '../../api/services/company.service';
import { ALLOWED_FILE_EXTENTIONS, FILE_MIME_TYPES, MAX_FILE_SIZE } from '../../util/file-parameters';
import { jsonParse } from '../../util/functions';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { hasClass } from '../../util/dom';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Autosize } from '../../directives/autosize.directive';
import { Subscription } from 'rxjs';
import { MediaQuery, MediaQueryService } from '../../util/media-query.service';
import { Project } from '../../api/models/Project';
import { ProjectMessage } from '../../api/models/ProjectMessage';
import { ProjectRequest } from '../../api/models/ProjectRequest';
import { distinctUntilChanged, first } from 'rxjs/internal/operators';
import { MyStompService } from '../../util/my-stomp.service';
import { ProjectActionService } from '../../util/project-action.service';

@Component({
  selector: 'messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss'],
  host: {
    '[class.disabled]': '!isMessengerEnabled()',
  }
})
export class MessengerComponent implements OnInit, OnDestroy {

  @Input() projectRequestId: string;
  @Input() projectRequestStatus: ProjectRequest.Status;
  @Input() projectStatus: Project.Status;
  @Input() targetUserIcon: string = '';
  @Input() customerName: string = '';
  @Input() contractorName: string = '';
  @Input() companyName: string = '';
  @Input() targetUserId: string = '';
  @Input() contentClass: string = '';

  @Output() onSystemMessage: EventEmitter<ProjectRequest.Status> = new EventEmitter<ProjectRequest.Status>();


  @ViewChild('messengerContent') messengerContent: ElementRef;
  @ViewChild('textAreaScrollBar') textAreaScrollBar: ElementRef;
  @ViewChild('messageListScrollBar') messageListScrollBar: PerfectScrollbarComponent;
  @ViewChild('chatInputForm') form: ElementRef;
  @ViewChild(Autosize) autosize: Autosize;
  // Reset file input
  @ViewChild('fileInput') file: ElementRef;

  MESSAGES_GLUE_TIME = 5000;
  IS_TYPING_TIME = 5000;
  READ_MESSAGES_DEBOUNCE_TIME = 1000;

  readEventSend: boolean = false;
  dragOver: boolean = false;
  isTyping: boolean = false;
  isTypingTimeOutReceive;
  isTypingSent: boolean = false;
  mediaQuery: MediaQuery;
  message: string = '';
  messages: Array<ProjectMessage> = [];
  files: Array<any> = [];
  Project = Project;
  ProjectRequest = ProjectRequest;
  sendButtonOffset: number = 0;
  fileUploadProgress: number = 0;


  private msgSubscription: Subscription;
  private latsReadTimeSubscription: any;
  private mediaWatcher: Subscription;

  constructor(public securityService: SecurityService,
              public projectRequestService: ProjectRequestService,
              public companyService: CompanyService,
              private myStompService: MyStompService,
              private query: MediaQueryService,
              private popUpService: PopUpMessageService,
              private projectActionService: ProjectActionService) {
    this.mediaWatcher = this.query.screen.pipe(
      distinctUntilChanged()
    ).subscribe((res: MediaQuery) => {
      this.mediaQuery = res;
    });
  }

  ngOnInit(): void {
    this.loadMessages();
    if (this.isMessengerEnabled()) {
      this.subscribeOnNewMessages();
    }
  }

  ngOnDestroy(): void {
    this.mediaWatcher.unsubscribe();
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    this.projectRequestService.getMessages(this.projectRequestId).pipe(
      first()
    )
      .subscribe(
        (messages: Array<ProjectMessage>) => {
          messages.forEach((item, index) => {
            // Push 1 message to array
            if (index == 0) {
              this.messages.push(item);
            } else if (this.checkNeedGlue(this.messages[this.messages.length - 1], item)) {
              this.messages[this.messages.length - 1].body = `${this.messages[this.messages.length - 1].body}\n${item.body}`;
              this.messages[this.messages.length - 1].created = item.created;
              this.messages[this.messages.length - 1].read = item.read;
            }
            // Push other messages
            else {
              this.messages.push(item);
            }
          });
          this.sendReadEvent();
        },
        err => {
          console.error(err);
        });
  }

  private subscribeOnNewMessages() {
    if (this.msgSubscription === undefined) {
      this.msgSubscription = this.myStompService.watch(`/topic/project-requests/${this.projectRequestId}`).subscribe(this.onMessage);
      console.log('Subscribed for messages on projectRequest ' + this.projectRequestId);
    }
  }

  private onMessage = (message: Message) => {
    let newMessage = JSON.parse(message.body) as ProjectMessage;
    console.log(newMessage);

    if (newMessage.event == this.ProjectRequest.MessageEvent.IS_TYPING) {
      this.handleIsTyping(newMessage);
      return;
    }

    this.handleSystemMessage((newMessage.event as ProjectRequest.MessageEvent));

    // if (newMessage.type == this.ProjectRequest.MessageType.PLAIN) {
    //   return;
    // }

    if (newMessage.event == this.ProjectRequest.MessageEvent.READ) {
      if (newMessage.sender != this.securityService.getLoginModel().id) {
        this.onReadEvent();
      }
      return;
    }

    if (newMessage.type == this.ProjectRequest.MessageType.DOCUMENT || newMessage.type == this.ProjectRequest.MessageType.IMAGE) {
      newMessage.body = typeof newMessage.body == 'string' ? jsonParse<MessengerDocument>(newMessage.body) : '';
    }

    let lastMessage = this.messages[this.messages.length - 1];
    let needGlue = this.checkNeedGlue(lastMessage, newMessage);

    if (needGlue) {
      newMessage.body = lastMessage.body + '\n' + newMessage.body;
      this.messages.splice(this.messages.length - 1, 1);
    }
    this.messages.push(newMessage);
    this.isTyping = false;
  };

  /**
   * Checks that two messages need to be glued
   */
  private checkNeedGlue(lastMessage: ProjectMessage, newMessage: ProjectMessage): boolean {
    return (newMessage.sender == lastMessage.sender &&
      (new Date(newMessage.created).getTime() - new Date(lastMessage.created).getTime()) < this.MESSAGES_GLUE_TIME) &&
      (newMessage.type == this.ProjectRequest.MessageType.TEXT && lastMessage.type == this.ProjectRequest.MessageType.TEXT);
  }

  submitForm(form): void {
    if (this.message && this.message.length > 0) {
      this.sendMessage(this.message, this.ProjectRequest.MessageType.TEXT, null);
      this.files = [];
      form.reset();
    }
  }

  private sendMessage(message: string = '', type: ProjectRequest.MessageType, event: ProjectRequest.MessageEvent) {
    if (message && message.trim() == '') return;
    const newMessage = new ProjectMessage(this.securityService.getLoginModel().id, message, type, event);
    this.myStompService.publish({destination: `/app/project-requests/${this.projectRequestId}`, body: JSON.stringify(newMessage)}, );
    //run adjust after synchronous function
    if (newMessage.event != this.ProjectRequest.MessageEvent.READ) {
      setTimeout(() => {
        this.autosize.adjust();
      }, 0);
    }

  }

  private sendFiles(fileList: Array<File>, fileCount: number): void {
    if (fileList.length > 0) {
      const formData = new FormData();
      formData.append('file', fileList[0]);
      this.projectRequestService.sendDocuments(formData)
        .subscribe(event => {
          //uploading
          if (event.type === HttpEventType.UploadProgress) {
            this.fileUploadProgress = Math.round((fileCount - fileList.length) * (100 / fileCount)) + (Math.round(100 * event.loaded / event.total) / fileCount);
          }
          //Uploaded
          else if (event instanceof HttpResponse) {
            const rawJson: string = JSON.stringify(event.body);
            this.sendMessage(rawJson, this.messageFileType(fileList[0]), null);
            fileList.splice(0, 1);
            this.sendFiles(fileList, fileCount);
          }
        }, error => {
          fileList.splice(0, 1);
          this.sendFiles(fileList, fileCount);
          if (error.message) {
            this.popUpService.showError(error.message);
          } else {
            this.popUpService.showError('Error while saving file');
          }
        });
    } else {
      this.fileUploadProgress = 0;
    }
  }

  private onReadEvent = (message?: Message) => {
    this.markAsReadMessages(true);
  };

  public sendReadEvent() {
    if (!this.readEventSend) {
      let haveUnreadMessages = this.messages.filter(message => {
        return !message.read && (message.sender != this.securityService.getLoginModel().id);
      }).length > 0;

      if (haveUnreadMessages) {
        this.sendMessage(null, this.ProjectRequest.MessageType.EVENT, this.ProjectRequest.MessageEvent.READ);
        this.markAsReadMessages(false);
      }
      setTimeout(() => {
        this.readEventSend = false;
      }, this.READ_MESSAGES_DEBOUNCE_TIME);
      this.readEventSend = true;
    }
  }

  scrollMessengerToBottom() {
    if (this.messageListScrollBar.directiveRef.disabled) {
      this.messageListScrollBar.directiveRef.elementRef.nativeElement.scrollTo(0, this.messageListScrollBar.directiveRef.elementRef.nativeElement.scrollHeight);
    } else {
      this.messageListScrollBar.directiveRef.scrollToBottom(0, 0);
    }
  }

  onFileChange(event): void {
    this.dragOver = false;
    this.files = event instanceof FileList ? Array.from(event) : Array.from(event.target.files);
    this.files = this.files.filter(file => this.validateFile(file));
    this.sendFiles(this.files, this.files.length);
  }

  markAsReadMessages(own: boolean) {
    this.messages = this.messages.map((message: ProjectMessage, index, array) => {
      if (own && this.securityService.getLoginModel().id == message.sender) {
        message.read = true;
      } else if (!own && this.securityService.getLoginModel().id != message.sender) {
        message.read = true;
      }
      return message;
    });
  }

  /**
   * Move send button 11px right when scrollbar appear
   */
  onScrollBarShow() {
    const el = this.textAreaScrollBar.nativeElement;
    setTimeout(() => {
      if (hasClass(el, 'ps--active-y') && this.sendButtonOffset == 0) {
        this.sendButtonOffset = 11;
      } else if (!hasClass(el, 'ps--active-y') && this.sendButtonOffset > 0) {
        this.sendButtonOffset = 0;
      }
    }, 100);
  }

  onKeyDown() {
    if (!this.isTypingSent) {
      this.sendMessage('', this.ProjectRequest.MessageType.EVENT, this.ProjectRequest.MessageEvent.IS_TYPING);
      this.markAsReadMessages(false);
      setTimeout(() => {
        this.isTypingSent = false;
      }, this.IS_TYPING_TIME);
      this.isTypingSent = true;
    }
  }

  messageFileType(file): ProjectRequest.MessageType {
    if (FILE_MIME_TYPES.images.includes(file.type)) {
      return ProjectRequest.MessageType.IMAGE;
    } else {
      return this.ProjectRequest.MessageType.DOCUMENT;
    }
  }

  validateFile(file): boolean {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_FILE_EXTENTIONS.includes(ext)) {
      this.popUpService.showError(`The file type of ${file.name} is not allowed.`);
      this.file.nativeElement.value = '';

      return false;
    }
    if (file.size > MAX_FILE_SIZE.bytes) {
      this.popUpService.showError(`The file ${file.name} has failed to upload. Maximum upload file size ${MAX_FILE_SIZE.megabytes} Mb.`);
      this.file.nativeElement.value = '';

      return false;
    }

    return true;
  }

  isMessengerEnabled(): boolean {
    return ProjectRequest.isActive(this.projectRequestStatus) && !Project.isArchived(this.projectStatus);
  }


  private handleIsTyping(message: ProjectMessage): void {
    if (message.sender != this.securityService.getLoginModel().id) {
      clearTimeout(this.isTypingTimeOutReceive);
      this.isTyping = true;
      this.isTypingTimeOutReceive = setTimeout(() => {
        this.isTyping = false;
      }, this.IS_TYPING_TIME);
    }
  }

  private handleSystemMessage(messageEvent: ProjectRequest.MessageEvent): void {
    switch (messageEvent) {
      case ProjectRequest.MessageEvent.DECLINE:
        this.onSystemMessage.emit(ProjectRequest.Status.DECLINED);
        break;
      case ProjectRequest.MessageEvent.CANCEL:
        this.onSystemMessage.emit(ProjectRequest.Status.INACTIVE);
        break;
      case ProjectRequest.MessageEvent.HIRE:
        this.onSystemMessage.emit(ProjectRequest.Status.HIRED);
        break;
      case ProjectRequest.MessageEvent.HIRE_OTHER:
        this.onSystemMessage.emit(ProjectRequest.Status.INACTIVE);
        break;
      case ProjectRequest.MessageEvent.LEAVE:
        this.onSystemMessage.emit(ProjectRequest.Status.CLOSED);
        break;
      case ProjectRequest.MessageEvent.CUSTOMER_CLOSE:
        this.onSystemMessage.emit(ProjectRequest.Status.INACTIVE);
        break;
      case ProjectRequest.MessageEvent.PRO_COMPLETE:
        this.onSystemMessage.emit(ProjectRequest.Status.COMPLETED);
        break;
      case ProjectRequest.MessageEvent.INVALIDATED:
        this.onSystemMessage.emit(ProjectRequest.Status.INACTIVE);
        break;
      default:
        break;
    }
  }
}
