#import "Badge.h"

@implementation Badge

- (void)get:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    NSString* callbackID = [arguments objectAtIndex:0];
    NSInteger intToReturn = [[UIApplication sharedApplication] applicationIconBadgeNumber];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt: intToReturn];
    [self writeJavascript:[pluginResult toSuccessCallbackString:callbackID]];
}

- (void)set:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    NSInteger value = [[arguments objectAtIndex:1] intValue];
    [[UIApplication sharedApplication] setApplicationIconBadgeNumber:value];
    [self get:arguments withDict: options];
}

@end
