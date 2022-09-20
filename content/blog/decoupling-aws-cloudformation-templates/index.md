---
title: Decoupling AWS CloudFormation Templates
date: "2021-05-15T20:08:57.486Z"
---

While using [CloudFormation](https://aws.amazon.com/cloudformation/) templates for deploying our infrastructure, we had to face the fact that a CloudFormation stack can only contain a maximum of [200 resources](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-limits.html)(now 500).

### Working around the limit

We decided to split our infrastructure into multiple stacks. CloudFormation has two main design patterns to achieve this, the [Nested Stack mode](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stack.html) and the [Cross Stack Reference mode](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/walkthrough-crossstackref.html). We went with Nested Stack Mode and we decided to split our resources based on the resource type. Similar resources were grouped in a single stack like shown below, </br>

- main-stack.yaml
  - backend-lambda-stack.yaml
  - api-gateway-stack.yaml
  - batch-stack.yaml
  - ...

Hence obviously, there came instances where one stack depended on the resources created by another stack, at that time we exported that particular resource and imported it in the stack that required it like shown in the example below,

**ParentStack**
```
AWSTemplateFormatVersion: '2010-09-09'
Description: 'main-parent-stack'

Resources:
  NestedStackA:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: "https://testbucket-bucket.s3.amazonaws.com/nestedStack-A.yaml"

  NestedStackB:
    Type: AWS::CloudFormation::Stack
    DependsOn: NestedStackA
    Properties:
      TemplateURL: "https://testbucket-bucket.s3.amazonaws.com/nestedStack-B.yaml"
```

**NestedStackA**

```
AWSTemplateFormatVersion: '2010-09-09'
Description: 'nested stack A'

Resources:
  ABatchJobDefinition:
    Type: AWS::Batch::JobDefinition
    Properties:
      ...
      ...
        Command:
          - python3
          - /app/script.py
          - Ref::jobId
          - Ref::role

Outputs:
  BatchArn:
    Value:
      Ref: ABatchJobDefinition
    Export:
      Name: "ABatchJobDefinition"
```

**NestedStackB**

```
AWSTemplateFormatVersion: '2010-09-09'
Description: 'nested stack B'

Resources:
  NestedTestLambdaFunction:
    ...
    ...
      Environment:
        Variables:
          batchJob: !ImportValue "ABatchJobDefinition"
```

While this worked well, there came the problem when we wanted to update the resource that is shared. In this case, it's the batch definition. Now whenever an update changed the output value of the shared resource, CloudFormation would complain that the [resource is in use by another stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-exports.html) and therefore cannot be updated.

<div class="error-box">
  Export ABatchJobDefinition cannot be updated as it is in use by main-stack-NestedStackB-1F4FO24RCWJGY
</div>
</br>

In our specific case, we wanted to pass an extra command-line argument to our python script along with `jobId` and `role` and that updated the output value or the logical id of the resource, since it created a new version of the batch definition. </br>
(Note: Not all updates change the output value)


Now, what do we do? </br>

One solution is to [follow this process](https://aws.amazon.com/premiumsupport/knowledge-center/cloudformation-stack-export-name-error/),
  1. Update NestedStackB to replace the import statements with the actual output value and deploy it.
  2. Now that the dependency has been removed, update NestedStackA with the additional parameter and deploy it.
  3. Then again in NestedStackB replace the actual output value with the import statement like earlier and deploy it again.

Sure that works, but,
- What if we want to update that resource again by adding another parameter? </br>
- What if there are multiple stacks that use the same resource in the future? </br>

Either way, just repeating the above method would not be the best long-term approach.

### How do we decouple them?

We tried a few things and then something clicked, this problem was strikingly similar to managing `state` in a react component. What do you do when you have to share state between two sibling components?

We [lift the state up](https://reactjs.org/docs/lifting-state-up.html) to the parent component and pass down the state as props to both the sibling. We tried to see if something similar would work. One difference is now we don't import the resource that we want rather, we pass it down as a [parameter](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html) to the stack that needs it and reference it from there.

The thing about parameters in CloudFormation is that it's not always known beforehand and can change depending on the user's input. So when we supply a resource as a parameter, CloudFormation shouldn't expect it to remain constant.

1) We exported the resource to be shared as usual from NestedStackA.
2) From the parent stack, we passed the output as a parameter to the NestedStackB.
3) The NestedStackB just referenced the resource from the parameter.

**ParentStack**
```
AWSTemplateFormatVersion: '2010-09-09'
Description: 'main-parent-stack'

Resources:
  NestedStackA:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: "https://testbucket-bucket.s3.amazonaws.com/nestedStack-A.yaml"

  NestedStackB:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: "https://testbucket-bucket.s3.amazonaws.com/nestedStack-B.yaml"
      Parameters:
        ABatchJobDefinition: !GetAtt NestedStackA.Outputs.BatchArn
```

**NestedStackA**

```
AWSTemplateFormatVersion: '2010-09-09'
Description: 'nested stack A'

Resources:
  ABatchJobDefinition:
    Type: AWS::Batch::JobDefinition
    Properties:
      ...
      ...
        Command:
          - python3
          - /app/script.py
          - Ref::jobId
          - Ref::role

Outputs:
  BatchArn:
    Value:
      Ref: ABatchJobDefinition
    Export:
      Name: "ABatchJobDefinition"
```

**NestedStackB**

```
AWSTemplateFormatVersion: '2010-09-09'
Description: 'nested stack B'

Parameters:
  ABatchJobDefinition:
      Type: String

Resources:
  NestedTestLambdaFunction:
    ...
    ...
      Environment:
        Variables:
          batchJob: !Ref ABatchJobDefinition
```

And that worked, which we later confirmed with AWS Support to be the right way to go about sharing resources in the Nested Stack mode. This allowed us to continue to update resources in the stack without worrying about change.