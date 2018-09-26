/*
* Author   Jonathan Lurie - http://me.jonathanlurie.fr
* License  Apache License 2.0
* Lab      Blue Brain Project, EPFL
*/


import Section from './Section.js'
import Soma from './Soma.js'


/**
 * A morphology is the data representation of a neurone's anatomy. It is composed
 * of one soma (cell body) and sections. Sections can be axons, dendrites, etc.
 * A Morphology instance can be built from scratch (though it can be a bit tedious)
 * but will generally be built using a JSON description.
 */
class Morphology {

  constructor () {
    this._id = null
    this._sections = {}
    this._soma = null

    // these are catgories of sections that we may need. Look at `getOrphanSections`
    // and `_findSpecialSection`
    this._specialSections = {}
  }


  /**
   * Set the ID of _this_ morphology
   * @param {String|Number} id - the id
   */
  setId (id) {
    this._id = id
  }


  /**
   * Get the ID of _this_ morphology
   * @return {String|Number}
   */
  getId () {
    return this._id
  }


  /**
   * Build a morphology from a raw dataset, that usually comes from a JSON file.
   * Note that some files do not provide any data about the soma. In this case, the Soma
   * instance remains `null`
   * @param {Object} rawMorphology - a flat tree description of a morphology
   */
  buildFromRawMorphology (rawMorphology) {
    let that = this

    // Sometimes, we have no data about the soma
    if (rawMorphology.soma) {
      this._soma = new Soma()
      this._soma.initWithRawSection( rawMorphology.soma )
    }

    // Build the Section instances.
    // This first step does not define parents nor children
    for (let i=0; i<rawMorphology.sections.length; i++) {
      let s = new Section(this)
      let sId = s.initWithRawSection( rawMorphology.sections[i] )
      this._sections[ sId ] = s
    }

    // Now we define parent and children
    for (let i=0; i<rawMorphology.sections.length; i++) {
      let currentRawSection = rawMorphology.sections[i]
      let currentSection = this._sections[ currentRawSection.id ]

      // adding a parent if there is one
      if (currentRawSection.parent !== null){ // can be 0 but cannot be null (in JS, 0 and null are diff)
        let parent = this._sections[ currentRawSection.parent ]
        currentSection.setParent( parent )
      }

      let children = currentRawSection.children.map(function(c){return that._sections[ c ]})
      for (let c=0; c<children.length; c++) {
        currentSection.addChild( children[c] )
      }
    }
  }


  /**
   * Retrieve the total number of section in this morphology
   * @return {Number}
   */
  getNumberOfSections () {
    return Object.keys( this._sections )
  }


  /**
   * Get a section, given its id
   * @param {String|Number} id - the id of a section
   * @return {Section|null} the requested section or null if the id is invalid
   */
  getSection (id) {
    if (id in this._sections) {
      return this._sections[id]
    }else{
      return null
    }
  }


  /**
   * Get all the sections of _this_ morphology as an array, because sometimes it's
   * more convenient for iterating.
   * @return {Array} array of Section instances
   */
  getArrayOfSections () {
    return Object.values( this._sections )
  }


  /**
   * Get the soma Object
   * @return {Soma}
   */
  getSoma () {
    return this._soma
  }


  /**
   * Get all the section with no parent (_parent = null)
   * Those are directly tied to the soma
   * @param {Boolean} force - if true, the fetching among the sections will be done again
   * @return {Array} array of Sections
   */
  getOrphanSections (force=false) {
    let speciality = "orphans"

    // extract, if not done before
    this._findSpecialSection(
      "orphans",
      function(s){
        return !s.getParent()
      },
      force
    )

    return this._specialSections[speciality]
  }



  /**
   * @private
   * Helper function to build a subset of Sections based on the selections perfomed by `selector`
   * @param {String} specialityName - name of the spaciality
   * @param {Function} selector - function that takes a Section and returns a boolean.
   * if true is return, a section will be selected
   * @param {Boolean} force - if true: rebuild the list, if false: just return the list previously build
   */
  _findSpecialSection (specialityName, selector, force=false) {
    if (!(specialityName in this._specialSections)) {
      this._specialSections[specialityName] = null
    }

    if (force || !this._specialSections[specialityName]) {
      this._specialSections[specialityName] = []
      let allSections = Object.values( this._sections )
      for (let i=0; i<allSections.length; i++) {
        if (selector(allSections[i])) {
          this._specialSections[specialityName].push(allSections[i])
        }
      }
    }
    return this._specialSections[specialityName]
  }

}

export default Morphology
