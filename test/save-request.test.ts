import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import SaveRequest = require('../lib/save-request-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SaveRequest.SaveRequestStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});