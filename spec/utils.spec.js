const { expect } = require('chai');
const {
  convertTimestampToDate,
  createRef,
  formatComments,
} = require('../utils');

describe('convertTimestampToDate', () => {
  it('returns a new object', () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).to.not.equal(input);
    expect(result).to.be.an('object');
  });
  it('converts a created_at property to a date', () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).to.be.an.instanceof(Date);
    expect(result.created_at).to.eql(new Date(timestamp));
  });
  it('does not mutate the input', () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).to.eql(control);
  });
  it('ignores includes any other key-value-pairs in returned object', () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).to.be.true;
    expect(result.key2).to.equal(1);
  });
  it('returns unchanged object if no created_at property', () => {
    const input = { key: 'value' };
    const result = convertTimestampToDate(input);
    const expected = { key: 'value' };
    expect(result).to.eql(expected);
  });
});

describe('createRef', () => {
  it('returns an empty object, when passed an empty array', () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).to.eql(expected);
  });
  it('returns a reference object when passed an array with a single items', () => {
    const input = [{ title: 'title1', article_id: 1, name: 'name1' }];
    let actual = createRef(input, 'title', 'article_id');
    let expected = { title1: 1 };
    expect(actual).to.eql(expected);
    actual = createRef(input, 'name', 'title');
    expected = { name1: 'title1' };
    expect(actual).to.eql(expected);
  });
  it('returns a reference object when passed an array with many items', () => {
    const input = [
      { title: 'title1', article_id: 1 },
      { title: 'title2', article_id: 2 },
      { title: 'title3', article_id: 3 },
    ];
    const actual = createRef(input, 'title', 'article_id');
    const expected = { title1: 1, title2: 2, title3: 3 };
    expect(actual).to.eql(expected);
  });
  it('does not mutate the input', () => {
    const input = [{ title: 'title1', article_id: 1 }];
    const control = [{ title: 'title1', article_id: 1 }];
    createRef(input);
    expect(input).to.eql(control);
  });
});

describe('formatComments', () => {
  it('returns an empty array, if passed an empty array', () => {
    const comments = [];
    expect(formatComments(comments, {})).to.eql([]);
    expect(formatComments(comments, {})).to.not.equal(comments);
  });
  it('converts created_by key to author', () => {
    const comments = [{ created_by: 'ant' }, { created_by: 'bee' }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].author).to.eql('ant');
    expect(formattedComments[0].created_by).to.be.undefined;
    expect(formattedComments[1].author).to.eql('bee');
    expect(formattedComments[1].created_by).to.be.undefined;
  });
  it('replaces belongs_to value with appropriate id when passed a reference object', () => {
    const comments = [{ belongs_to: 'title1' }, { belongs_to: 'title2' }];
    const ref = { title1: 1, title2: 2 };
    const formattedComments = formatComments(comments, ref);
    expect(formattedComments[0].article_id).to.equal(1);
    expect(formattedComments[1].article_id).to.equal(2);
  });
  it('converts created_at timestamp to a date', () => {
    const timestamp = Date.now();
    const comments = [{ created_at: timestamp }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].created_at).to.eql(new Date(timestamp));
  });
});
