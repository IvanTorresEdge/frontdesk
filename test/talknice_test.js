var assert = chai.assert;

describe('Talknice', function() {

  describe('#parse', function() {

    it('returns an empty object when no params', function() {
      var parse = Talknice.parser();
      assert.deepEqual(parse(), {});
    });

    it('does nothing without config', function() {
      var parse = Talknice.parser();
      var data  = { id: 1 };
      assert.equal(parse(data), data);
    });

    it('filters attributes', function() {
      var parse = Talknice.parser({ attrs: ['id'] });
      var data  = { id: 1, name: 'foo' };
      assert.deepEqual(parse(data), { id: 1 });
    });

    it('alias attributes', function() {
      var parse = Talknice.parser({ attrs: [{'id': 'number'}] });
      var data  = { id: 1 };
      assert.deepEqual(parse(data), { number: 1 });
    });

    it('walks/builds nested attrs', function () {
      var parse = Talknice.parser({ attrs: ['user.current.name'] });
      var data  = { user: { current: { id: 1, name: 'talknice' }}};
      assert.deepEqual(parse(data), { user: { current: { name: 'talknice' }}});
    });

    it('flattens nested attrs', function () {
      var parse = Talknice.parser({ attrs: [{'user.current.name': 'user_name'}] });
      var data  = { user: { current: { id: 1, name: 'talknice' }}};
      assert.deepEqual(parse(data), { user_name: 'talknice' });
    });

    it('builds nested attrs', function () {
      var parse = Talknice.parser({ attrs: [{'user_name': 'user.name'}] });
      var data  = { user_name: 'talknice' };
      assert.deepEqual(parse(data), { user: { name: 'talknice' }});
    });

    // TODO: Next, arrays and nested arrays
  });

});
