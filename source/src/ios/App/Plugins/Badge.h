#ifdef CORDOVA_FRAMEWORK
#import <Cordova/CDVPlugin.h>
#else
#import "CDVPlugin.h"
#endif

@interface Badge : CDVPlugin {
}

- (void)get:(NSMutableArray*)args withDict:(NSMutableDictionary*)options;

- (void)set:(NSMutableArray*)number withDict:(NSMutableDictionary*)options;

@end
