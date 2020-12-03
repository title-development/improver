import { QuestionaryBlock } from './questionary-model';
import { BaseLeadInfo, ServiceType, UserAddress } from './data-model';

export class RequestOrder {
  projectId?: number;
  serviceId: number;
  serviceName: string;
  questionary: Array<QuestionaryBlock>;
  baseLeadInfo: BaseLeadInfo;
  address: UserAddress;

  static build(formData: any, questions: Array<QuestionaryBlock>, serviceType: ServiceType, isAddressManual): RequestOrder {
    delete formData?.defaultQuestionaryGroup?.customerPersonalInfo?.password
    const requestOrder = new RequestOrder();
    requestOrder.serviceId = serviceType.id;
    requestOrder.serviceName = serviceType.name;
    requestOrder.questionary = RequestOrder.parseQuestionaryAnswers(formData.questionaryGroup, questions)
    requestOrder.baseLeadInfo = new BaseLeadInfo(formData.defaultQuestionaryGroup.customerPersonalInfo, formData.defaultQuestionaryGroup.startExpectation, formData.defaultQuestionaryGroup.notes);
    requestOrder.address = new UserAddress(formData.defaultQuestionaryGroup.projectLocation, isAddressManual)
    return requestOrder;
  }

  static parseQuestionaryAnswers(questionaryGroup, qeustionary: Array<QuestionaryBlock>) {
    return qeustionary.map(question => {
      let value = questionaryGroup[question.name];
      if (!Array.isArray(value)) value = [value]
      return new QuestionaryBlock(question.title, (value as Array<string>))
    })
  }

}
