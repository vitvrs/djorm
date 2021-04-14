const { QueryError } = require('../errors')
const { QueryFormatter } = require('../QueryFormatter')

describe('QueryFormatter', () => {
  it('formatValue converts integer into string', () => {
    expect(new QueryFormatter().formatValue(10)).toBe('10')
  })

  it('formatValue converts simple float into string', () => {
    expect(new QueryFormatter().formatValue(3.14)).toBe('3.14')
  })

  it('formatValue converts true to 1', () => {
    expect(new QueryFormatter().formatValue(true)).toBe('1')
  })

  it('formatValue converts false to 0', () => {
    expect(new QueryFormatter().formatValue(false)).toBe('0')
  })

  it('formatValue escapes apostrophe', () => {
    expect(new QueryFormatter().formatValue("I'm happy")).toBe("'I\\'m happy'")
  })

  it('formatValue escapes quote', () => {
    expect(new QueryFormatter().formatValue('This is very "interesting"')).toBe(
      '\'This is very \\"interesting\\"\''
    )
  })

  it('formatValue escapes backslash', () => {
    expect(new QueryFormatter().formatValue('This is very "interesting"')).toBe(
      '\'This is very \\"interesting\\"\''
    )
  })

  it('formatValue escapes percent', () => {
    expect(new QueryFormatter().formatValue('100%')).toBe("'100\\%'")
  })

  it('formatValue escapes backspace char', () => {
    expect(new QueryFormatter().formatValue('Not innocent string\x08')).toBe(
      "'Not innocent string\\b'"
    )
  })

  it('formatValue escapes escaped zero char', () => {
    expect(new QueryFormatter().formatValue('Not innocent string\0')).toBe(
      "'Not innocent string\\0'"
    )
  })

  it('formatValue escapes tab char', () => {
    expect(new QueryFormatter().formatValue('Not innocent string\x09')).toBe(
      "'Not innocent string\\t'"
    )
  })

  it('formatValue escapes substitute char', () => {
    expect(new QueryFormatter().formatValue('Not innocent string\x1a')).toBe(
      "'Not innocent string\\z'"
    )
  })

  it('formatValue escapes newline char', () => {
    expect(new QueryFormatter().formatValue('Not innocent string\n')).toBe(
      "'Not innocent string\\n'"
    )
  })

  it('formatValue escapes carriage return char', () => {
    expect(new QueryFormatter().formatValue('Not innocent string\r')).toBe(
      "'Not innocent string\\r'"
    )
  })

  it('formatValue escapes carriage return char', () => {
    expect(new QueryFormatter().formatValue('Not innocent string\r')).toBe(
      "'Not innocent string\\r'"
    )
  })

  it('formatValue throws QueryError given value is custom object', () => {
    class HumourClass {}
    expect(() => new QueryFormatter().formatValue(new HumourClass())).toThrow(
      QueryError
    )
  })
})
