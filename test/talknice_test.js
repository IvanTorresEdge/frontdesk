var assert = chai.assert;

describe('Talknice', function() {

  describe('#parse', function () {

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

    it('process arrays', function () {
      var parser = Talknice.parser({ properties: ['id'] }),
          data   = [{ id: 1, name: 'Name 1' }, { id: 2, name: 'Name 2' }];
      assert.deepEqual(parser.parse(data), [{ id: 1 }, { id: 2 }]);
    });

  });
});
