import { QuestionaryBlock } from './questionary-model';
import { ServiceType } from './data-model';
import { extractObjectValues } from '../util/functions';

export class RequestOrder {
  defaultQuestionaryGroup: {
    startExpectation: string;
    projectDetails: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
  };
  questionaryGroup: Array<QuestionaryBlock>;
  serviceId: number;
  serviceName: string;

  static build(formData: any, serviceType: ServiceType): RequestOrder {
    delete formData?.defaultQuestionaryGroup?.customerPersonalInfo?.password
    const requestOrder = new RequestOrder();
    requestOrder.serviceId = serviceType.id;
    requestOrder.serviceName = serviceType.name;
    requestOrder.questionaryGroup = Object.entries(formData.questionaryGroup)
      .map(item => {
        const results = Array.isArray(item[1]) ? item[1] : [item[1]];
        return new QuestionaryBlock(item[0], (results as Array<string>));
      });
    requestOrder.defaultQuestionaryGroup = extractObjectValues({}, formData.defaultQuestionaryGroup);

    return requestOrder;
  }
}
