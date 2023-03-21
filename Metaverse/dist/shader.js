var tvFragment = `precision highp float;
 
varying vec2 vUV;
uniform float tvWidthHeightScale;
uniform float mvWidthHeightScale;

uniform float bforceforceKeepContent;

 
uniform sampler2D texture_video; 

// \u7B49\u6BD4\u4F8B\u7F29\u653E\u753B\u9762\u5360\u6EE1\u5C4F\u5E55\uFF0C\u5B58\u5728\u5185\u5BB9\u7684\u4E22\u5931
vec2 equalScalingFitTvSize(vec2 uv, float tvWidthHeightScale, float mvWidthHeightScale)
{
    if( tvWidthHeightScale > mvWidthHeightScale )
    {
        float scale = mvWidthHeightScale/tvWidthHeightScale;
        uv.y = (uv.y - 0.5) * scale + 0.5;
    }else if( tvWidthHeightScale < mvWidthHeightScale )
    {
        float scale = tvWidthHeightScale/mvWidthHeightScale;
        uv.x = (uv.x - 0.5) * scale + 0.5;
    }
    return vec2( uv.x , uv.y);
}

// \u5F3A\u5236\u4FDD\u7559\u753B\u9762\u5185\u5BB9\uFF08\u5E26\u6709\u9ED1\u8FB9\uFF09
vec2 forceKeepContent(vec2 uv, float tvWidthHeightScale, float mvWidthHeightScale)
{
    if( tvWidthHeightScale > mvWidthHeightScale )
    {
        float scale = mvWidthHeightScale/tvWidthHeightScale;
        uv.x = (uv.x - 0.5) / scale + 0.5;
    }else if( tvWidthHeightScale < mvWidthHeightScale )
    {
        float scale = tvWidthHeightScale/mvWidthHeightScale;
        uv.y = (uv.y - 0.5) / scale + 0.5;
    }
    return vec2( uv.x , uv.y);
}

void main()
{     
    vec2 uv = vUV;
    vec3 rgb; 
    vec3 color = vec3(0,0,0);

    // \u4E00\u65E6\u8BBE\u7F6E\u4E86mvWidthHeightScale\uFF0C\u5C31\u4F1A\u89E6\u53D1\u7B49\u6BD4\u4F8B\u7F29\u653Eor\u5F3A\u5236\u4FDD\u5185\u5BB9
    if(tvWidthHeightScale > 0.0 && mvWidthHeightScale > 0.0)
    {
        if(bforceforceKeepContent > 0.0){
            uv = forceKeepContent(uv, tvWidthHeightScale, mvWidthHeightScale); 
        }else{
            uv = equalScalingFitTvSize(uv, tvWidthHeightScale, mvWidthHeightScale); 
        }
    }
    
    color = texture2D(texture_video, uv).rgb;
 
    if( uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 )
    {
        color = vec3(0,0,0);
    }
    gl_FragColor = vec4(color, 1.0);  
}

`
  , tvVertex = `precision highp float;
 
varying vec2 vUV;

attribute vec2 uv;
attribute vec3 position;
 
uniform mat4 view;
uniform mat4 projection; 
uniform mat4 world; 

void main()
{  
    vUV = uv; 
    gl_Position = projection * view * world * vec4(position , 1.0); 
}
`;







var pureVideoFragment = `precision highp  float;

varying vec3 ModelPos;

uniform float isYUV;  // false: 0, true: 1.0
uniform sampler2D texture_video;
// uniform sampler2D chrominanceYTexture;
// uniform sampler2D chrominanceUTexture;
// uniform sampler2D chrominanceVTexture;

uniform float haveShadowLight;
varying vec4 vPositionFromLight;
uniform float fireworkLight;
varying float fireworkDistance;
varying float fireworkCosTheta;

uniform sampler2D shadowSampler;

// uniform float focal;
// uniform float captureWidth;
// uniform float captureHeight;
uniform vec3 focal_width_height;

const float inv_2_PI = 0.1591549; // 1 / (2 * pi)
const float inv_PI =   0.3183099; // 1 / (  pi)
const vec2 invAtan = vec2(0.1591549, 0.3183099);

float unpack(vec4 color)
{
    const vec4 bit_shift = vec4(1.0 / (255.0 * 255.0 * 255.0), 1.0 / (255.0 * 255.0), 1.0 / 255.0, 1.0);
    return dot(color, bit_shift);
}

float ShadowCalculation(vec4 vPositionFromLight, sampler2D ShadowMap)
{
    vec3 projCoords = vPositionFromLight.xyz / vPositionFromLight.w;
    vec3 depth = 0.5 * projCoords + vec3(0.5);
    vec2 uv = depth.xy;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)
    {
        return 1.0;
    }
    #ifndef SHADOWFULLFLOAT
        float shadow = unpack(texture2D(ShadowMap, uv));
    #else
        float shadow = texture2D(ShadowMap, uv).x;
    #endif

    if (depth.z > shadow - 1e-4)
    {
        return 0.7;
    }
    else
    {
        return 1.0;
    }
}

// const float f = 514.133282; //937.83246;
// const float w = 720.0;
// const float h = 1280.0;


// vec2 SampleTex(vec3 pt3d, vec2 widthHeight)
vec2 SampleTex(vec3 pt3d)
{
    // // vec2 uv = vec2(  f/w*pt3d.x/pt3d.z, f/h*pt3d.y/pt3d.z ); // \u6A21\u578B\u53D8\u6362\u5230\u76F8\u673A\u5750\u6807\u7CFB\u4E0B
    // vec2 uv = vec2(  focal/captureWidth*pt3d.x/pt3d.z, focal/captureHeight*pt3d.y/pt3d.z ); // \u6A21\u578B\u53D8\u6362\u5230\u76F8\u673A\u5750\u6807\u7CFB\u4E0B
    // uv.x = uv.x + 0.5;
    // uv.y = uv.y + 0.5;
    // return uv;
    return focal_width_height.x / focal_width_height.yz *pt3d.xy/pt3d.z + 0.5;
}
 
void main()
{    
    vec3 yuv;
    vec3 rgb;
    vec2 uv;
    vec3 color = vec3(0,0,0);
    vec3 flash_color = fireworkLight * 1000.0 / fireworkDistance * fireworkCosTheta * vec3(1,0,0); 
    float shadow = 1.0;
    if (haveShadowLight > 0.5)
    {
        shadow = ShadowCalculation(vPositionFromLight, shadowSampler);
    }

    // uv =  SampleTex( normalize(ModelPos), vec2(captureWidth, captureHeight));
    uv =  SampleTex( normalize(ModelPos) );
    if( isYUV < 0.5 )
    {
        color = texture2D(texture_video, uv).rgb;
    }else{
        const mat4 YUV2RGB = mat4
        (
            1.1643828125, 0, 1.59602734375, -.87078515625,
            1.1643828125, -.39176171875, -.81296875, .52959375,
            1.1643828125, 2.017234375, 0, -1.081390625,
            0, 0, 0, 1
        );    
        
       vec4 result = vec4( 
                        texture2D(texture_video, vec2(uv.x, uv.y*0.666666 + 0.333333 ) ).x,
                        texture2D(texture_video, vec2(uv.x * 0.5, uv.y*0.333333 ) ).x, 
                        texture2D(texture_video, vec2(0.5 + uv.x * 0.5,  uv.y*0.333333 ) ).x,
                        1) * YUV2RGB;  
        color = clamp(result.rgb, 0.0, 1.0); 
    }
    if( uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 )
    {
        color = vec3(0,0,0);
    }
    // gl_FragColor = vec4(shadow, shadow, shadow, 1.0); 
    gl_FragColor = vec4(shadow * (color + flash_color) * 1.0, 1.0); 
}

`
  , pureVideoVertex = `precision highp float;

varying vec3 ModelPos;

varying vec4 vPositionFromLight;
varying float fireworkDistance;
varying float fireworkCosTheta;

attribute vec2 uv;
attribute vec3 position;

attribute vec4 world0;
attribute vec4 world1;
attribute vec4 world2;
attribute vec4 world3;

#ifdef NORMAL
attribute vec3 normal;
#endif



uniform vec3 fireworkLightPosition;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 lightSpaceMatrix;

uniform mat4 world;
uniform mat4 worldViewProjection;
float DistanceCalculation(vec3 Q, vec3 P)
{
    return (Q.x - P.x) * (Q.x - P.x) + (Q.y - P.y) * (Q.y - P.y) + (Q.z - P.z) * (Q.z - P.z);
}
float CosThetaCalculation(vec3 Q, vec3 P)
{
    return max(0.,dot(Q, P));
}
void main()
{
    
    #include<instancesVertex>

    vPositionFromLight =  lightSpaceMatrix * finalWorld * vec4(position, 1.0);
    
    // fireworkDistance = DistanceCalculation(vec3(finalWorld * vec4(position, 1.0)), fireworkLightPosition);
    fireworkDistance = distance(vec3(finalWorld * vec4(position, 1.0)), fireworkLightPosition);
     
    
    fireworkCosTheta = 1.0;
    #ifdef NORMAL
    vec3 directionFirework = fireworkLightPosition.xyz - vec3(finalWorld * vec4(position, 1.0));
    directionFirework = normalize(directionFirework);
    // directionFirework = directionFirework / (directionFirework.x * directionFirework.x + directionFirework.y * directionFirework.y + directionFirework.z * directionFirework.z);
    fireworkCosTheta = CosThetaCalculation(directionFirework, normal);
    #endif
    
    ModelPos = vec3( view * finalWorld * vec4(position , 1.0));
    gl_Position = projection * view * finalWorld * vec4(position , 1.0); 
}
`
  , panoFragment = `precision highp float;

uniform float isYUV;  // false: 0, true: 1.0

varying vec2 TexCoords;
varying vec3 WorldPos;  
varying vec3 vNormal;

uniform float haveShadowLight;
varying vec4 vPositionFromLight;
uniform float fireworkLight;
varying float fireworkDistance;
varying float fireworkCosTheta;

uniform sampler2D shadowSampler;

uniform vec3 centre_pose;  
uniform sampler2D texture_pano; 
const float inv_2_PI = 0.1591549; // 1 / (2 * pi)
const float inv_PI =   0.3183099; // 1 / (  pi)
const vec2 invAtan = vec2(0.1591549, 0.3183099);

float unpack(vec4 color)
{
    const vec4 bit_shift = vec4(1.0 / (255.0 * 255.0 * 255.0), 1.0 / (255.0 * 255.0), 1.0 / 255.0, 1.0);
    return dot(color, bit_shift);
}
  

float ShadowCalculation(vec4 vPositionFromLight, sampler2D ShadowMap)
{
    vec3 projCoords = vPositionFromLight.xyz / vPositionFromLight.w;
    vec3 depth = 0.5 * projCoords + vec3(0.5);
    vec2 uv = depth.xy;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)
    {
        return 1.0;
    }
    #ifndef SHADOWFULLFLOAT
        float shadow = unpack(texture2D(ShadowMap, uv));
    #else
        float shadow = texture2D(ShadowMap, uv).x;
    #endif

    if (depth.z > shadow)
    {
        return 0.7;
    }
    else
    {
        return 1.0;
    }
}
 
vec2 SampleSphericalMap(vec3 pt3d)
{
    vec2 uv = vec2( atan(-pt3d.z,pt3d.x), atan( pt3d.y, sqrt(pt3d.x*pt3d.x + pt3d.z * pt3d.z))); 
    uv.x = 0.5 + uv.x * inv_2_PI ;     // yaw:   \u6C34\u5E73\u65B9\u5411 \uFF0C0 \u5230 360 \uFF0C \u5BF9\u5E948k\u7684\u5BBD  
    uv.y = 0.5 + uv.y * inv_PI ;       // pitch: \u7AD6\u76F4\u65B9\u5411\uFF0C -64 \u5230 64 \uFF0C\u5BF9\u5E944k\u7684\u957F

    return vec2(uv.x,uv.y);
} 

vec3 fitUint8Range(vec3 color)
{
    if( color.x < 0.0 ){color.x = 0.0;}
    if( color.x > 1.0 ){color.x = 1.0;}
    if( color.y < 0.0 ){color.y = 0.0;}
    if( color.y > 1.0 ){color.y = 1.0;}
    if( color.z < 0.0 ){color.z = 0.0;}
    if( color.z > 1.0 ){color.z = 1.0;}
    return color;
}

void main()
{    
//  // Debug
    // vec3 vLightPosition = vec3(0,10,100); 
    // // World values
    // vec3 vPositionW = vec3( WorldPos.x, WorldPos.y, WorldPos.z );
    // vec3 vNormalW = normalize( vNormal) ;
    // vec3 viewDirectionW = normalize(vPositionW);
    // // Light
    // vec3 lightVectorW = normalize(vLightPosition - vPositionW); 
    // // diffuse
    // float ndl = max(0., dot(vNormalW, lightVectorW));
    // gl_FragColor = vec4( ndl, ndl, ndl, 1.);

    vec2 uv;
    vec3 color = vec3(0,0,0);  
 
    vec3 flash_color = fireworkLight * 1000.0 / fireworkDistance * fireworkCosTheta * vec3(1,0,0); 
    float shadow = 1.0;
    if (haveShadowLight > 0.5)
    {
        shadow = ShadowCalculation(vPositionFromLight, shadowSampler);
    }

    uv = SampleSphericalMap(normalize( WorldPos - centre_pose ));

    if( isYUV < 0.5 )
    {
        color = texture2D(texture_pano, uv).rgb;  
    }else{
        const mat4 YUV2RGB = mat4
                (
                    1.1643828125, 0, 1.59602734375, -.87078515625,
                    1.1643828125, -.39176171875, -.81296875, .52959375,
                    1.1643828125, 2.017234375, 0, -1.081390625,
                    0, 0, 0, 1
                );    
                
        vec4 result = vec4( 
                            texture2D(texture_pano, vec2(uv.x, uv.y*0.666666 + 0.333333 ) ).x,
                            texture2D(texture_pano, vec2(uv.x * 0.5, uv.y*0.333333 ) ).x, 
                            texture2D(texture_pano, vec2(0.5 + uv.x * 0.5,  uv.y*0.333333 ) ).x,
                            1) * YUV2RGB;  
        color = fitUint8Range(result.rgb);        
    }
    if( uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 )
    {
        color = vec3(0,0,0);
    }
    gl_FragColor = vec4( shadow * (color + flash_color), 1.0); 
}`
  , panoVertex = `precision highp float;

varying vec2 TexCoords;
varying vec3 vNormal;
varying vec3 WorldPos; 

varying vec4 vPositionFromLight;
varying float fireworkDistance;
varying float fireworkCosTheta;
uniform vec3 fireworkLightPosition;
uniform mat4 lightSpaceMatrix;

attribute vec3 normal;
attribute vec2 uv; 
attribute vec3 position;  

uniform mat4 view;
uniform mat4 projection; 
uniform mat4 world;
uniform mat4 worldViewProjection;
 
attribute vec4 world0;
attribute vec4 world1;
attribute vec4 world2;
attribute vec4 world3;

float DistanceCalculation(vec3 Q, vec3 P)
{
    return (Q.x - P.x) * (Q.x - P.x) + (Q.y - P.y) * (Q.y - P.y) + (Q.z - P.z) * (Q.z - P.z);
}
float CosThetaCalculation(vec3 Q, vec3 P)
{
    return max(0.,dot(Q, P));
}

void main()
{ 
    #include<instancesVertex>

    vPositionFromLight =  lightSpaceMatrix * world * vec4(position, 1.0);
    fireworkDistance = DistanceCalculation(vec3(finalWorld * vec4(position, 1.0)), fireworkLightPosition);
    fireworkCosTheta = 1.0;
    vec3 newP = vec3( finalWorld * vec4(position, 1.0) );
    WorldPos = newP;
    TexCoords = uv;     
    vNormal = normal; 
    gl_Position = projection * view * vec4(newP , 1.0); 
}

`;