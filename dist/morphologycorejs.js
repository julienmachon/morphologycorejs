(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.morphologycorejs = {})));
}(this, (function (exports) { 'use strict';

  /**
   * A section is a list of 3D points and some metadata. A section can have one parent
   * and multiple children when the dendrite or axone divide into mutliple dendrites
   * and axons.
   * A section instance can be built from scratch of it can be built using a raw object,
   * usually from a JSON description.
   */
  class Section {


    /**
     * To construct a section, we need a reference to the morphology instance that
     * 'hosts' them. This may seem a bit a bit counter intuitive to have a reference
     * in that direction but it can be very convenient, when knowing a section, to
     * know to which morphology it belongs (i.e. raycasting a section)
     * @param {Morphology} morphology - the Morphology instance that host _this_ section
     */
    constructor (morphology=null) {
      this._id = null;
      this._parent = null;
      this._children = [];
      this._typename = null;
      this._typevalue = null;
      this._points = null;
      this._radiuses = null;
      this._morphology = morphology;
    }


    /**
     * Defines the id of this seciton.
     * Note: should probably not be used after `initWithRawSection` because then
     * sections already have ids and chance to messup the id game are pretty high.
     * @param {String|Number} id - the id
     */
    setId (id) {
      this._id = id;
    }


    /**
     * Get the id of _this_ section
     * @return {String|Number}
     */
    getId () {
      return this._id
    }


    setTypename (tn) {
      // TODO: use a table that makes the relation bt typevalue and typename
      this._typename = tn;
    }

    getTypename () {
      return this._typename
    }


    setTypeValue (tv) {
      this._typevalue = tv;
    }

    getTypevalue () {
      return this._typevalue
    }


    addPoint (x, y, z, r=1) {
      this._points.push( [x, y, z] );
      this._radiuses.push( r );
    }

    getPoints () {
      return this._points
    }

    getRadiuses () {
      return this._radiuses
    }

    /**
     * Build a section using a raw section object.
     * @param {Object} rawSection - usually comes from a JSON file
     */
    initWithRawSection (rawSection) {
      this._id = rawSection.id;
      this._typename = rawSection.typename;
      this._typevalue = rawSection.typevalue;
      this._points = rawSection.points.map( function(p){return p.position});
      this._radiuses = rawSection.points.map( function(p){return p.radius});

      return this._id
    }


    /**
     * Define the parent section of _this_ section, as an object reference.
     * The only verification perfomed by this method is that a section is not added
     * as its own parent.
     * @param {Section} section - the section that is the parent of this one
     * @return {Boolean} true if parent was successfully defined, false if not.
     */
    setParent (section) {
      if (section && section.getId() !== this._id) {
        this._parent = section;
        return true
      }

      console.warn( "A section cannot be the parent of itself.");
      return false
    }


    /**
     * Make a given section the child of _this_ one.
     * Two verifications are perfomed before: ids must be diferent so that we are
     * not allowing a section to be the child of itself, and that _this_ section
     * does not already have the given section as a children (=> avoid doublons)
     * @param {Section} section - The section to add as a child
     * @return {Boolean} true if successfully added (of if already has the given child),
     * false if the candidate cannot be a child
     */
    addChild (section) {
      if (section.getId() !== this._id) {
        if (this.hasChild(section)) {
          console.warn("The given section is already one of the child to this one.");
        } else {
          this._children.push( section );
        }
        return true

      } else {
        console.warn("A section cannot be the child of itself.");
        return false
      }

      return true
    }


    /**
     * Checks if a given section is already one of the children of _this_ section
     * @param {Section} section - a section to test
     * @return {Boolean} true if the given section is already a child of _this_ section, false if not.
     */
    hasChild (section) {
      if (!this._children)
        return false

      let candidateId = section.getId();

      for (let i=0; i<this._children.length; i++) {
        if (this._children[i].getId() === candidateId)
          return true
      }

      return false
    }


  }

  /**
   * The soma is the cell body of a neurone and thus is sort of a simplified version
   * of a Section, in term of datastructure.
   */
  class Soma {
    constructor () {
      this._id = null;
      this._typename = "soma";
      this._typevalue = 1;
      this._center = null;
      this._radius = null;
    }

    /**
     * Defines the id of this soma.
     * Note: should probably not be used after `initWithRawSection` because then
     * sections already have ids and chance to messup the id game are pretty high.
     * @param {String|Number} id - the id
     */
    setId (id) {
      this._id = id;
    }


    /**
     * Get the id of _this_ soma
     * @return {String|Number}
     */
    getId () {
      return this._id
    }


    setCenter (x, y, z) {
      this._center = [x, y, z];
    }


    getCenter () {
      return this._center
    }


    setRadius (r) {
      this._radius = r;
    }


    getRadius () {
      return this._radius
    }

    /**
     * Build a soma using a raw soma object.
     * @param {Object} rawSoma - usually comes from a JSON file
     */
    initWithRawSection (rawSoma) {
      this._id = rawSoma.id;
      this._center = rawSoma.center;
      this._radius = rawSoma.radius;

      return this._id
    }
  }

  /**
   * A morphology is the data representation of a neurone's anatomy. It is composed
   * of one soma (cell body) and sections. Sections can be axons, dendrites, etc.
   * A Morphology instance can be built from scratch (though it can be a bit tedious)
   * but will generally be built using a JSON description.
   */
  class Morphology {

    constructor () {
      this._id = null;
      this._sections = {};
      this._soma = null;
    }


    /**
     * Set the ID of _this_ morphology
     * @param {String|Number} id - the id
     */
    setId (id) {
      this._id = id;
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
     *
     */
    buildFromRawMorphology (rawMorphology) {
      let that = this;

      this._soma = new Soma();
      this._soma.initWithRawSection( rawMorphology.soma );

      // Build the Section instances.
      // This first step does not define parents nor children
      for (let i=0; i<rawMorphology.sections.length; i++) {
        let s = new Section();
        let sId = s.initWithRawSection( rawMorphology.sections[i] );
        this._sections[ sId ] = s;
      }

      // Now we define parent and children
      for (let i=0; i<rawMorphology.sections.length; i++) {
        let currentRawSection = rawMorphology.sections[i];
        let currentSection = this._sections[ currentRawSection.id ];

        // adding a parent if there is one
        if (currentRawSection.parent){
          let parent = this._sections[ currentRawSection.parent ];
          currentSection.setParent( parent );
        }

        let children = currentRawSection.children.map(function(c){return that._sections[ c ]});
        for (let c=0; c<children.length; c++) {
          currentSection.addChild( children[c] );
        }
      }


      // Build the Soma instance
      // TODO
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


    getSoma () {
      return this._soma
    }

    
  }

  exports.Morphology = Morphology;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
