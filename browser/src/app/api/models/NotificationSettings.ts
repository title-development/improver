export class ContractorNotificationSettings {
  receiveNewLeadsEmail: boolean;
  receiveNewLeadsSms: boolean
  receiveNewSubscriptionLeadsEmail: boolean;
  receiveNewSubscriptionLeadsSms: boolean;
  receiveMessagesEmail: boolean;
  receiveSuggestionsEmail: boolean;
  quickReply: boolean;
  replyText: string
}

export class CustomerNotificationSettings {
  receiveMessagesEmail: boolean;
  receiveNewProjectRequestsEmail: boolean;
  receiveNewProjectRequestsSms: boolean;
  receiveSuggestionsEmail: boolean;
}
