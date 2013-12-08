describe('Talknice', function() {

  describe('#parse', function () {

    describe('root element', function () {
      it('parses', function () {
        var parser = Talknice.parser({ root: 'user', properties: ['id'] }),
            data   = { user: { id: 1 } };
        assert.deepEqual(parser.parse(data), { user: { id: 1 } });
      });

      it('removes', function () {
        var parser = Talknice.parser({ root: 'user>', properties: ['id'] }),
            data   = { user: { id: 1 } };
        assert.deepEqual(parser.parse(data), { id: 1 });
      });

      it('prepends', function () {
        var parser = Talknice.parser({ root: '>user', properties: ['id'] }),
            data   = { id: 1 };
        assert.deepEqual(parser.parse(data), { user: { id: 1 } });
      });

      it('aliases', function () {
        var parser = Talknice.parser({ root: 'user>person', properties: ['id'] }),
            data   = { user: { id: 1 } };
        assert.deepEqual(parser.parse(data), { person: { id: 1 } });
      });

      describe('nested root element', function () {
        it('parses', function () {
          var parser = Talknice.parser({ root: 'user.attributes', properties: ['id'] }),
              data   = { user: { attributes : { id: 1 } } };
          assert.deepEqual(parser.parse(data), { user: { attributes: { id: 1 } } });
        });

        it('removes', function () {
          var parser = Talknice.parser({ root: 'user.attributes>', properties: ['id'] }),
              data   = { user: { attributes : { id: 1 } } };
          assert.deepEqual(parser.parse(data), { id: 1 });
        });

        it('prepends', function () {
          var parser = Talknice.parser({ root: '>user.attributes', properties: ['id'] }),
              data   = { id: 1 };
          assert.deepEqual(parser.parse(data), { user: { attributes: { id: 1 } } });
        });

        it('aliases', function () {
          var parser = Talknice.parser({ root: 'user.attributes>user.attrs', properties: ['id'] }),
              data   = { user: { attributes: { id: 1 } } };
          assert.deepEqual(parser.parse(data), { user: { attrs: { id: 1 } } });
        });
      });
    });

    describe('filtering of properties', function () {
      it('1st form', function () {
        var parser = Talknice.parser({ properties: ['id'] }),
            data   = { id: 1, other: 'other' };
        assert.deepEqual(parser.parse(data), { id: 1 });
      });

      it('2nd form', function () {
        var parser = Talknice.parser({ properties: [{ 'id': { /* other settings */ } }] }),
            data   = { id: 1, other: 'other' };
        assert.deepEqual(parser.parse(data), { id: 1 });
      });

      it('3rd form', function () {
        var parser = Talknice.parser({ properties: [{ name: 'id' }] }),
            data   = { id: 1, other: 'other' };
        assert.deepEqual(parser.parse(data), { id: 1 });
      });
    });

    describe('aliasing of properties', function () {
      it('1st form', function () {
        var parser = Talknice.parser({ properties: [{ 'id': 'number' }] }),
            data   = { id: 1 };
        assert.deepEqual(parser.parse(data), { number: 1 });
      });

      it('2nd form', function () {
        var parser = Talknice.parser({ properties: [{ 'id': { alias: 'number' } }] }),
            data   = { id: 1 };
        assert.deepEqual(parser.parse(data), { number: 1 });
      });

      it('3rd form', function () {
        var parser = Talknice.parser({ properties: [{ name: 'id',  alias: 'number' }] }),
            data   = { id: 1 };
        assert.deepEqual(parser.parse(data), { number: 1 });
      });
    });

    describe('nested properties', function () {
      it('re-creates nested properties', function () {
          var parser = Talknice.parser({ properties: ['foo.bar'] }),
              data   = { foo: { bar: 'baz' } };
          assert.deepEqual(parser.parse(data), { foo: { bar: 'baz' } });
      });

      describe('with aliases', function () {
        it('transforms property path', function () {
            var parser = Talknice.parser({ properties: [{ 'foo.bar': 'bar.foo' }] }),
                data   = { foo: { bar: 'baz' } };
            assert.deepEqual(parser.parse(data), { bar: { foo: 'baz' } });
        });

        it('flattens property path', function () {
            var parser = Talknice.parser({ properties: [{ 'foo.bar': 'foo_bar' }] }),
                data   = { foo: { bar: 'baz' } };
            assert.deepEqual(parser.parse(data), { foo_bar: 'baz' });
        });

        it('expands property', function () {
            var parser = Talknice.parser({ properties: [{ 'fooBar': 'foo.bar' }] }),
                data   = { fooBar: 'baz' };
            assert.deepEqual(parser.parse(data), { foo: { bar: 'baz' }});
        });
      });
    });

    describe('callbacks', function () {
      it('calls #beforeParse if present', function () {
        var data, parser;

        data = {};

        parser = Talknice.parser({
          properties: [{ id: 'number' }],
          beforeParse: function (config, obj) {
            return [{ id: 1 }, { id: 2 }];
          }
        });

        assert.deepEqual(parser.parse(data), [{ number: 1 }, { number: 2 }]);
      });

      it('calls #afterParse if present', function () {
        var data, parser;

        data = [{ id: 1 }, { id: 2 }];

        parser = Talknice.parser({
          properties: [{ id: 'number' }],
          afterParse: function (config, obj) {
            obj.push({ count: 2 });
            return obj;
          }
        });

        assert.deepEqual(parser.parse(data), [{ number: 1 }, { number: 2 }, { count: 2 }]);
      });

      it('calls #beforeParseElement if present', function () {
        var data, parser;

        data = [{ id: 1 }, { id: 2 }];

        parser = Talknice.parser({
          properties: ['number'],
          beforeParseElement: function (config, obj) {
            return { number: obj.id };
          }
        });

        assert.deepEqual(parser.parse(data), [{ number: 1 }, { number: 2 }]);
      });

      it('calls #afterParseElement if present', function () {
        var data, parser;

        data = [{ id: 1 }, { id: 2 }];

        parser = Talknice.parser({
          properties: ['id'],
          afterParseElement: function (config, obj) {
            return { number: obj.id };
          }
        });

        assert.deepEqual(parser.parse(data), [{ number: 1 }, { number: 2 }]);
      });
    });

    it('process arrays', function () {
      var parser = Talknice.parser({ properties: ['id'] }),
          data   = [{ id: 1, name: 'Name 1' }, { id: 2, name: 'Name 2' }];
      assert.deepEqual(parser.parse(data), [{ id: 1 }, { id: 2 }]);
    });

    describe('properties options', function () {
      describe('`value` option', function () {
        it('does nothing when value is present', function () {
          var parser = Talknice.parser({ properties: [
            { myProperty: { value: 'defaultValue' } }
          ]});
          assert.deepEqual(parser.parse({myProperty: 'myValue'}), {myProperty: 'myValue'});
        });

        it('sets default value', function () {
          var parser = Talknice.parser({ properties: [
            { myProperty: { value: 'defaultValue' } }
          ]});
          assert.deepEqual(parser.parse({}), {myProperty: 'defaultValue'});
        });

        describe('when default value is a function', function () {
          beforeEach(function () {
            this.stub = sinon.stub().returns('defaultValue');

            this.config = { properties: [
              { myProperty: { value: this.stub  } }
            ]};

            this.parser = Talknice.parser(this.config);
          });

          it('calls a function', function () {
            this.parser.parse({});
            assert.isTrue(this.stub.called);
          });

          it('sets the default value', function () {
            assert.deepEqual(this.parser.parse({}), {myProperty: 'defaultValue'});
          });
        });
      });

      describe('`type` option', function () {
        it('does nothing when value is present', function () {
          var parser = Talknice.parser({ properties: [
            { myProperty: { type: 'boolean' } }
          ]});
          assert.deepEqual(parser.parse({myProperty: true}), {myProperty: true});
        });

        it('sets false if `boolean`', function () {
          var parser = Talknice.parser({ properties: [
            { myProperty: { type: 'boolean' } }
          ]});
          assert.deepEqual(parser.parse({}), {myProperty: false});
        });

        it('sets a date object if `date`', function () {
          var parser = Talknice.parser({ properties: [
                { myProperty: { type: 'date' } }
              ]});
          assert.isTrue(parser.parse({}).myProperty instanceof Date);
        });

        it('sets a zero if `number`', function () {
          var parser = Talknice.parser({ properties: [
            { myProperty: { type: 'number' } }
          ]});
          assert.deepEqual(parser.parse({}), {myProperty: 0});
        });
      });
    });
  });
});
