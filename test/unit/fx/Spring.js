define(function(require) {

  var Spring = require('lavaca/fx/Spring');

  describe('A Spring', function() {
    describe('can have an initial state', function() {
      describe('with a translate value', function() {
        it('as a single number', function() {
          Spring.setInitialState({
            translate: 10
          });
          expect(Spring.initial.translate).toEqual({x: 10, y: 10, z: 10});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setInitialState({
            translate: {
              x: 10,
              y: 11,
              z: 12
            }
          });
          expect(Spring.initial.translate).toEqual({x: 10, y: 11, z: 12});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setInitialState({
            translate: {
              x: 10,
              z: 12
            }
          });
          expect(Spring.initial.translate).toEqual({x: 10, y: 0, z: 12});
        });
        it('as an object with y specified as a number', function() {
          Spring.setInitialState({
            translate: {
              y: 11
            }
          });
          expect(Spring.initial.translate).toEqual({x: 0, y: 11, z: 0});
        });
      });
      describe('with a scale value', function() {
        it('as a single number', function() {
          Spring.setInitialState({
            scale: 10
          });
          expect(Spring.initial.scale).toEqual({x: 10, y: 10, z: 10});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setInitialState({
            scale: {
              x: 10,
              y: 11,
              z: 12
            }
          });
          expect(Spring.initial.scale).toEqual({x: 10, y: 11, z: 12});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setInitialState({
            scale: {
              x: 10,
              z: 12
            }
          });
          expect(Spring.initial.scale).toEqual({x: 10, y: 1, z: 12});
        });
        it('as an object with y specified as a number', function() {
          Spring.setInitialState({
            scale: {
              y: 11
            }
          });
          expect(Spring.initial.scale).toEqual({x: 1, y: 11, z: 1});
        });
      });
      describe('with a rotate value', function() {
        it('as a single number', function() {
          Spring.setInitialState({
            rotate: 10
          });
          expect(Spring.initial.rotate).toEqual({x: 0, y: 0, z: 10});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setInitialState({
            rotate: {
              x: 10,
              y: 11,
              z: 12
            }
          });
          expect(Spring.initial.rotate).toEqual({x: 10, y: 11, z: 12});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setInitialState({
            rotate: {
              x: 10,
              z: 12
            }
          });
          expect(Spring.initial.rotate).toEqual({x: 10, y: 0, z: 12});
        });
        it('as an object with y specified as a number', function() {
          Spring.setInitialState({
            rotate: {
              y: 11
            }
          });
          expect(Spring.initial.rotate).toEqual({x: 0, y: 11, z: 0});
        });
      });
      describe('with a skew value', function() {
        it('as a single number', function() {
          Spring.setInitialState({
            skew: 10
          });
          expect(Spring.initial.skew.x).toEqual(10);
          expect(Spring.initial.skew.y).toEqual(10);
        });
        it('as an object with only x and y specified as numbers', function() {
          Spring.setInitialState({
            skew: {
              x: 10,
              y: 12
            }
          });
          expect(Spring.initial.skew.x).toEqual(10);
          expect(Spring.initial.skew.y).toEqual(12);
        });
        it('as an object with y specified as a number', function() {
          Spring.setInitialState({
            skew: {
              y: 11
            }
          });
          expect(Spring.initial.skew.x).toEqual(0);
          expect(Spring.initial.skew.y).toEqual(11);
        });
      });
      describe('with a perspective value', function() {
        it('as a single number', function() {
          Spring.setInitialState({
            perspective: 10
          });
          expect(Spring.initial.perspective).toEqual(10);
        });
      });
    });

    describe('can determine a result state based on known differences', function() {
      beforeEach(function() {
        Spring.setInitialState({
          translate: 10,
          scale: 20,
          rotate: {x: 30, y: 30, z: 30},
          skew: 40,
          perspective: 50
        });
      });
      describe('with a translate value', function() {
        it('as a single number', function() {
          Spring.setDifferences({
            translate: 200
          });
          Spring.determineResultState();
          expect(Spring.resultState.translate).toEqual({x: 210, y: 210, z: 210});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setDifferences({
            translate: {
              x: 200,
              y: 201,
              z: 202
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.translate).toEqual({x: 210, y: 211, z: 212});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setDifferences({
            translate: {
              x: 200,
              z: 202
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.translate).toEqual({x: 210, y: 10, z: 212});
        });
        it('as an object with y specified as a number', function() {
          Spring.setDifferences({
            translate: {
              y: 201
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.translate).toEqual({x: 10, y: 211, z: 10});
        });
      });
      describe('with a scale value', function() {
        it('as a single number', function() {
          Spring.setDifferences({
            scale: 10
          });
          Spring.determineResultState();
          expect(Spring.resultState.scale).toEqual({x: 30, y: 30, z: 30});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setDifferences({
            scale: {
              x: 10,
              y: 11,
              z: 12
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.scale).toEqual({x: 30, y: 31, z: 32});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setDifferences({
            scale: {
              x: 10,
              z: 12
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.scale).toEqual({x: 30, y: 20, z: 32});
        });
        it('as an object with y specified as a number', function() {
          Spring.setDifferences({
            scale: {
              y: 11
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.scale).toEqual({x: 20, y: 31, z: 20});
        });
      });
      describe('with a rotate value', function() {
        it('as a single number', function() {
          Spring.setDifferences({
            rotate: 10
          });
          Spring.determineResultState();
          expect(Spring.resultState.rotate).toEqual({x: 30, y: 30, z: 40});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setDifferences({
            rotate: {
              x: 10,
              y: 11,
              z: 12
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.rotate).toEqual({x: 40, y: 41, z: 42});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setDifferences({
            rotate: {
              x: 10,
              z: 12
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.rotate).toEqual({x: 40, y: 30, z: 42});
        });
        it('as an object with y specified as a number', function() {
          Spring.setDifferences({
            rotate: {
              y: 11
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.rotate).toEqual({x: 30, y: 41, z: 30});
        });
      });
      describe('with a skew value', function() {
        it('as a single number', function() {
          Spring.setDifferences({
            skew: 10
          });
          Spring.determineResultState();
          expect(Spring.resultState.skew.x).toEqual(50);
          expect(Spring.resultState.skew.y).toEqual(50);
        });
        it('as an object with only x and y specified as numbers', function() {
          Spring.setDifferences({
            skew: {
              x: 10,
              y: 12
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.skew.x).toEqual(50);
          expect(Spring.resultState.skew.y).toEqual(52);
        });
        it('as an object with y specified as a number', function() {
          Spring.setDifferences({
            skew: {
              y: 11
            }
          });
          Spring.determineResultState();
          expect(Spring.resultState.skew.x).toEqual(40);
          expect(Spring.resultState.skew.y).toEqual(51);
        });
      });
      describe('with a perspective value', function() {
        it('as a single number', function() {
          Spring.setDifferences({
            perspective: 10
          });
          Spring.determineResultState();
          expect(Spring.resultState.perspective).toEqual(60);
        });
      });
    });




    describe('can determine differences based on known initial and result states', function() {
      beforeEach(function() {
        Spring.setInitialState({
          translate: 10,
          scale: 20,
          rotate: {x: 30, y: 30, z: 30},
          skew: 40,
          perspective: 50
        });
      });
      describe('with a translate value', function() {
        it('as a single number', function() {
          Spring.setResultState({
            translate: 220
          });
          Spring.determineDifferences();
          expect(Spring.differences.translate).toEqual({x: 210, y: 210, z: 210});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setResultState({
            translate: {
              x: 220,
              y: 221,
              z: 222
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.translate).toEqual({x: 210, y: 211, z: 212});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setResultState({
            translate: {
              x: 220,
              z: 222
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.translate).toEqual({x: 210, y: 0, z: 212});
        });
        it('as an object with y specified as a number', function() {
          Spring.setResultState({
            translate: {
              y: 221
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.translate).toEqual({x: 0, y: 211, z: 0});
        });
      });
      describe('with a scale value', function() {
        it('as a single number', function() {
          Spring.setResultState({
            scale: 50
          });
          Spring.determineDifferences();
          expect(Spring.differences.scale).toEqual({x: 30, y: 30, z: 30});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setResultState({
            scale: {
              x: 50,
              y: 51,
              z: 52
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.scale).toEqual({x: 30, y: 31, z: 32});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setResultState({
            scale: {
              x: 50,
              z: 52
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.scale).toEqual({x: 30, y: 0, z: 32});
        });
        it('as an object with y specified as a number', function() {
          Spring.setResultState({
            scale: {
              y: 51
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.scale).toEqual({x: 0, y: 31, z: 0});
        });
      });
      describe('with a rotate value', function() {
        it('as a single number', function() {
          Spring.setResultState({
            rotate: 70
          });
          Spring.determineDifferences();
          expect(Spring.differences.rotate).toEqual({x: 0, y: 0, z: 40});
        });
        it('as an object with x, y, and z specified as numbers', function() {
          Spring.setResultState({
            rotate: {
              x: 70,
              y: 71,
              z: 72
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.rotate).toEqual({x: 40, y: 41, z: 42});
        });
        it('as an object with only x and z specified as numbers', function() {
          Spring.setResultState({
            rotate: {
              x: 70,
              z: 72
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.rotate).toEqual({x: 40, y: 0, z: 42});
        });
        it('as an object with y specified as a number', function() {
          Spring.setResultState({
            rotate: {
              y: 71
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.rotate).toEqual({x: 0, y: 41, z: 0});
        });
      });
      describe('with a skew value', function() {
        it('as a single number', function() {
          Spring.setResultState({
            skew: 90
          });
          Spring.determineDifferences();
          expect(Spring.differences.skew.x).toEqual(50);
          expect(Spring.differences.skew.y).toEqual(50);
        });
        it('as an object with only x and y specified as numbers', function() {
          Spring.setResultState({
            skew: {
              x: 90,
              y: 92
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.skew.x).toEqual(50);
          expect(Spring.differences.skew.y).toEqual(52);
        });
        it('as an object with y specified as a number', function() {
          Spring.setResultState({
            skew: {
              y: 91
            }
          });
          Spring.determineDifferences();
          expect(Spring.differences.skew.x).toEqual(0);
          expect(Spring.differences.skew.y).toEqual(51);
        });
      });
      describe('with a perspective value', function() {
        it('as a single number', function() {
          Spring.setResultState({
            perspective: 110
          });
          Spring.determineDifferences();
          expect(Spring.differences.perspective).toEqual(60);
        });
      });
    });


    describe('can default the result state and differences with only a known initial state', function() {
      beforeEach(function() {
        Spring.setInitialState({
          translate: 10,
          scale: 20,
          rotate: {x: 30, y: 30, z: 30},
          skew: 40,
          perspective: 50
        });
        Spring.setResultState({});
        Spring.determineDifferences();
      });
      it('for a translate value', function() {
        expect(Spring.differences.translate).toEqual({x: -10, y: -10, z: -10});
        expect(Spring.resultState.translate).toEqual({x: 0, y: 0, z: 0});
      });
      it('for a scale value', function() {
        expect(Spring.differences.scale).toEqual({x: -19, y: -19, z: -19});
        expect(Spring.resultState.scale).toEqual({x: 1, y: 1, z: 1});
      });
      it('for a rotate value', function() {
        expect(Spring.differences.rotate).toEqual({x: -30, y: -30, z: -30});
        expect(Spring.resultState.rotate).toEqual({x: 0, y: 0, z: 0});
      });
      it('for a skew value', function() {
        expect(Spring.differences.skew.x).toEqual(-40);
        expect(Spring.differences.skew.y).toEqual(-40);
        expect(Spring.resultState.skew.x).toEqual(0);
        expect(Spring.resultState.skew.y).toEqual(0);
      });
      it('for a perspective value', function() {
        expect(Spring.differences.perspective).toEqual(-50);
        expect(Spring.resultState.perspective).toEqual(undefined);
      });
    });


    describe('can use a ratio to determine the new step value', function() {
      var initial;
      var difference;
      var ratio;

      beforeEach(function() {
        initial = 0;
        difference = 100;
        ratio = 50; //out of 100
      });
      it('with a positive number', function() {
        var value = Spring.getStepTransformValue(initial, ratio, difference);
        expect(value).toEqual(ratio);
      });
      it('with a negative number', function() {
        ratio = -50;
        var value = Spring.getStepTransformValue(initial, ratio, difference);
        expect(value).toEqual(ratio);
      });
      it('with nonzero initial, difference, and ratio values', function() {
        initial = 100;
        difference = 300;
        ratio = 50;
        var value = Spring.getStepTransformValue(initial, ratio, difference);
        expect(value).toEqual(250);
      });
    });

    describe('can generate a keyframe step', function() {
      it('with an ease-in-out timing function', function() {
        var basicTransform = {
          translate: {x: 1, y: 1, z:1},
          scale: {},
          rotate: {},
          skew: {}
        };
        var step = Spring.setKeyframeStep(0, basicTransform);
        expect(step['animation-timing-function']).toBeDefined();
        expect(step['animation-timing-function']).toEqual('ease-in-out');
      });
      describe('with correct transforms written', function() {
        describe('for a translate', function() {
          it('with all values specified', function() {
            var step = Spring.createTranslate3d({ x: 10, y: 11, z: 12 });
            expect(step).toBeDefined();
            expect(step).toContain('translate3d(10px,11px,12px)');
          });
          it('with only one value specified', function() {
            var step = Spring.createTranslate3d({ x: undefined, y: 11, z: undefined });
            expect(step).toBeDefined();
            expect(step).toContain('translate3d(0px,11px,0px)');
          });
          it('with only zero values specified', function() {
            var step = Spring.createTranslate3d({ x: undefined, y: undefined, z: undefined });
            expect(step).toBeDefined();
            expect(step).toEqual('');
          });
        });
        describe('for a scale', function() {
          it('with all values specified', function() {
            var step = Spring.createScale3d({ x: 10, y: 11, z: 12 });
            expect(step).toBeDefined();
            expect(step).toContain('scale3d(10,11,12)');
          });
          it('with only one value specified', function() {
            var step = Spring.createScale3d({ x: undefined, y: 11, z: undefined });
            expect(step).toBeDefined();
            expect(step).toContain('scale3d(1,11,1)');
          });
          it('with only zero values specified', function() {
            var step = Spring.createScale3d({ x: undefined, y: undefined, z: undefined });
            expect(step).toBeDefined();
            expect(step).toEqual('');
          });
        });
        describe('for a rotate', function() {
          it('with all values specified', function() {
            var step = Spring.createRotate({ x: 10, y: 11, z: 12 });
            expect(step).toBeDefined();
            expect(step).toContain('rotateX(10deg)');
            expect(step).toContain('rotateY(11deg)');
            expect(step).toContain('rotateZ(12deg)');
          });
          it('with only one value specified', function() {
            var step = Spring.createRotate({ x: undefined, y: 11, z: undefined });
            expect(step).toBeDefined();
            expect(step).not.toContain('rotateX');
            expect(step).toContain('rotateY(11deg)');
            expect(step).not.toContain('rotateZ');
          });
          it('with only zero values specified', function() {
            var step = Spring.createRotate({ x: undefined, y: undefined, z: undefined });
            expect(step).toBeDefined();
            expect(step).toEqual('');
          });
        });
        describe('for a skew', function() {
          it('with all values specified', function() {
            var step = Spring.createSkew({ x: 10, y: 11, z: undefined });
            expect(step).toBeDefined();
            expect(step).toContain('skewX(10deg)');
            expect(step).toContain('skewY(11deg)');
          });
          it('with only one value specified', function() {
            var step = Spring.createSkew({ x: undefined, y: 11, z: undefined });
            expect(step).toBeDefined();
            expect(step).not.toContain('skewX');
            expect(step).toContain('skewY(11deg)');
          });
          it('with only zero values specified', function() {
            var step = Spring.createSkew({ x: undefined, y: undefined, z: undefined });
            expect(step).toBeDefined();
            expect(step).toEqual('');
          });
        });
        describe('for perspective', function() {
          it('with a value specified', function() {
            var step = Spring.createPerspective(11);
            expect(step).toBeDefined();
            expect(step).toContain('perspective(11)');
          });
          it('with no value specified', function() {
            var step = Spring.createPerspective(undefined);
            expect(step).toBeDefined();
            expect(step).toEqual('');
          });
        });
      });
    });
  });

});
