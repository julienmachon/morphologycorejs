import Soma from '../Soma'

describe('Soma Class', () => {
  it('Should create a new instance', () => {
    const soma = new Soma()

    expect(soma.getId()).toEqual(null)
  })
})
