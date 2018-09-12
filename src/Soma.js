
/**
 * The soma is the cell body of a neurone and thus is sort of a simplified version
 * of a Section, in term of datastructure.
 */
class Soma {
  constructor () {
    this._id = null
    this._typename = "soma"
    this._typevalue = 1
    this._center = null
    this._radius = null
  }

  /**
   * Defines the id of this soma.
   * Note: should probably not be used after `initWithRawSection` because then
   * sections already have ids and chance to messup the id game are pretty high.
   * @param {String|Number} id - the id
   */
  setId (id) {
    this._id = id
  }


  /**
   * Get the id of _this_ soma
   * @return {String|Number}
   */
  getId () {
    return this._id
  }


  /**
   * Build a soma using a raw soma object.
   * @param {Object} rawSoma - usually comes from a JSON file
   */
  initWithRawSection (rawSoma) {
    this._id = rawSoma.id
    this._center = rawSoma.center
    this._radius = rawSoma.radius

    return this._id
  }
}


export { Soma }
