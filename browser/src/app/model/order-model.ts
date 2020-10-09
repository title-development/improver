import { QuestionaryBlock } from './questionary-model';
import { BaseLeadInfo, ServiceType, UserAddress } from './data-model';

export class RequestOrder {
  projectId?: number;
  serviceId: number;
  serviceName: string;
  questionary: Array<QuestionaryBlock>;
  baseLeadInfo: BaseLeadInfo;
  address: UserAddress;

  static build(formData: any, serviceType: ServiceType, isAddressManual): RequestOrder {
    delete formData?.defaultQuestionaryGroup?.customerPersonalInfo?.password
    const requestOrder = new RequestOrder();
    requestOrder.serviceId = serviceType.id;
    requestOrder.serviceName = serviceType.name;
    requestOrder.questionary = Object.entries(formData.questionaryGroup)
      .map(item => {
        const results = Array.isArray(item[1]) ? item[1] : [item[1]];
        return new QuestionaryBlock(item[0], (results as Array<string>));
      });
    requestOrder.baseLeadInfo = new BaseLeadInfo(formData.defaultQuestionaryGroup.customerPersonalInfo, formData.defaultQuestionaryGroup.startExpectation, formData.defaultQuestionaryGroup.notes);
    requestOrder.address = new UserAddress(formData.defaultQuestionaryGroup.projectLocation, isAddressManual)

    return requestOrder;
  }
}
