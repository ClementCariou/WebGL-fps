'use strict';

const SHADOW_RES = 4096;
// This is copy pasted from the directional light shadow example
// It doesn't seems to work correctly (normal/light direction/transform problem)
// I might anyway change it for shadow volumes to avoid its limitations
module.exports = (regl) => {
	const fbo = regl.framebuffer({
		color: regl.texture({
			width: SHADOW_RES,
			height: SHADOW_RES,
			wrap: 'clamp',
			type: 'float'
		}),
		depth: true
	});
	return {
		drawDepth: regl({
			frag: `
            precision mediump float;
            varying vec3 vPosition;
            void main () {
                gl_FragColor = vec4(vec3(vPosition.z), 1.0);
            }`,
			vert: `
            precision mediump float;
            attribute vec3 position;
            uniform mat4 lightProjection, lightView;
            attribute vec4 m0, m1, m2, m3;
            varying vec3 vPosition;
            void main() {
                mat4 model = mat4(m0, m1, m2, m3);
                vec4 p = lightProjection * lightView * model * vec4(position, 1.0);
                gl_Position = p;
                vPosition = p.xyz;
            }`,
			framebuffer: fbo
		}),
		drawNormals: regl({
			frag: `
            precision mediump float;
            varying vec3 vNormal;
            varying vec3 vShadowCoord;
            uniform float ambientLightAmount;
            uniform float diffuseLightAmount;
            uniform sampler2D shadowMap;
            uniform vec3 lightDir;
            uniform float minBias;
            uniform float maxBias;
            #define texelSize 1.0 / float(${SHADOW_RES})
            float shadowSample(vec2 co, float z, float bias) {
                float a = texture2D(shadowMap, co).z;
                float b = vShadowCoord.z;
                return step(b-bias, a);
            }
            void main () {
                float cosTheta = dot(vNormal, lightDir);
                vec2 co = vShadowCoord.xy * 0.5 + 0.5;// go from range [-1,+1] to range [0,+1]
                // counteract shadow acne.
                float bias = max(maxBias * (1.0 - cosTheta), minBias);
                float shadow0 = shadowSample(co + texelSize * vec2(0.0, 0.0), vShadowCoord.z, bias);
                float shadow1 = shadowSample(co + texelSize * vec2(1.0, 0.0), vShadowCoord.z, bias);
                float shadow2 = shadowSample(co + texelSize * vec2(0.0, 1.0), vShadowCoord.z, bias);
                float shadow3 = shadowSample(co + texelSize * vec2(1.0, 1.0), vShadowCoord.z, bias);
                // PCF filtering
                float shadow = (shadow0 + shadow1 + shadow2 + shadow3) / 4.0;
                // if outside light frustum, render now shadow.
                // If WebGL had GL_CLAMP_TO_BORDER we would not have to do this,
                // but that is unfortunately not the case...
                if(co.x < 0.00 || co.x > 1.0 || co.y < 0.0 || co.y > 1.0) {
                    shadow = 1.0;
                }
                float diffuseValue = clamp((cosTheta + 1.0) / 2.0, 0.0, 1.0);
                diffuseValue = diffuseValue * (shadow + 1.0) / 2.0;
                vec3 ambient = vec3(ambientLightAmount);
                vec3 diffuse = vec3(diffuseLightAmount) * diffuseValue;
                gl_FragColor = vec4(pow((ambient + diffuse), vec3(1.0/2.2)), 1.0);
            }`,
			vert: `
            precision mediump float;
            uniform mat4 projection, view;
            uniform mat4 lightProjection, lightView;
            attribute vec4 m0, m1, m2, m3;
            attribute vec3 position, normal;
            attribute vec2 uv;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vShadowCoord;

            void main () {
                vPosition = position;
                mat4 model = mat4(m0, m1, m2, m3);
                vNormal = normalize(mat3(model) * normal);
                vec4 worldSpacePosition = model * vec4(position, 1);
                gl_Position = projection * view * worldSpacePosition;
                vShadowCoord = (lightProjection * lightView * worldSpacePosition).xyz;
            }`,
			uniforms: {
				shadowMap: fbo,
				minBias: 0.002,
				maxBias: 0.004,
				ambientLightAmount: 0.3,
				diffuseLightAmount: 0.7
			}
		})
	};
};
