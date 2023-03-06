/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const synthpop = $root.synthpop = (() => {

    /**
     * Namespace synthpop.
     * @exports synthpop
     * @namespace
     */
    const synthpop = {};

    synthpop.Population = (function() {

        /**
         * Properties of a Population.
         * @memberof synthpop
         * @interface IPopulation
         * @property {Array.<synthpop.IHousehold>|null} [households] Population households
         * @property {Array.<synthpop.IPerson>|null} [people] Population people
         * @property {Object.<string,synthpop.IVenueList>|null} [venuesPerActivity] Population venuesPerActivity
         * @property {Object.<string,synthpop.IInfoPerMSOA>|null} [infoPerMsoa] Population infoPerMsoa
         * @property {synthpop.ILockdown} lockdown Population lockdown
         * @property {Array.<synthpop.ITimeUseDiary>|null} [timeUseDiaries] Population timeUseDiaries
         * @property {number} year Population year
         */

        /**
         * Constructs a new Population.
         * @memberof synthpop
         * @classdesc Represents a Population.
         * @implements IPopulation
         * @constructor
         * @param {synthpop.IPopulation=} [properties] Properties to set
         */
        function Population(properties) {
            this.households = [];
            this.people = [];
            this.venuesPerActivity = {};
            this.infoPerMsoa = {};
            this.timeUseDiaries = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Population households.
         * @member {Array.<synthpop.IHousehold>} households
         * @memberof synthpop.Population
         * @instance
         */
        Population.prototype.households = $util.emptyArray;

        /**
         * Population people.
         * @member {Array.<synthpop.IPerson>} people
         * @memberof synthpop.Population
         * @instance
         */
        Population.prototype.people = $util.emptyArray;

        /**
         * Population venuesPerActivity.
         * @member {Object.<string,synthpop.IVenueList>} venuesPerActivity
         * @memberof synthpop.Population
         * @instance
         */
        Population.prototype.venuesPerActivity = $util.emptyObject;

        /**
         * Population infoPerMsoa.
         * @member {Object.<string,synthpop.IInfoPerMSOA>} infoPerMsoa
         * @memberof synthpop.Population
         * @instance
         */
        Population.prototype.infoPerMsoa = $util.emptyObject;

        /**
         * Population lockdown.
         * @member {synthpop.ILockdown} lockdown
         * @memberof synthpop.Population
         * @instance
         */
        Population.prototype.lockdown = null;

        /**
         * Population timeUseDiaries.
         * @member {Array.<synthpop.ITimeUseDiary>} timeUseDiaries
         * @memberof synthpop.Population
         * @instance
         */
        Population.prototype.timeUseDiaries = $util.emptyArray;

        /**
         * Population year.
         * @member {number} year
         * @memberof synthpop.Population
         * @instance
         */
        Population.prototype.year = 0;

        /**
         * Creates a new Population instance using the specified properties.
         * @function create
         * @memberof synthpop.Population
         * @static
         * @param {synthpop.IPopulation=} [properties] Properties to set
         * @returns {synthpop.Population} Population instance
         */
        Population.create = function create(properties) {
            return new Population(properties);
        };

        /**
         * Encodes the specified Population message. Does not implicitly {@link synthpop.Population.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Population
         * @static
         * @param {synthpop.IPopulation} message Population message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Population.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.households != null && message.households.length)
                for (let i = 0; i < message.households.length; ++i)
                    $root.synthpop.Household.encode(message.households[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.people != null && message.people.length)
                for (let i = 0; i < message.people.length; ++i)
                    $root.synthpop.Person.encode(message.people[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.venuesPerActivity != null && Object.hasOwnProperty.call(message, "venuesPerActivity"))
                for (let keys = Object.keys(message.venuesPerActivity), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 0 =*/8).int32(keys[i]);
                    $root.synthpop.VenueList.encode(message.venuesPerActivity[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.infoPerMsoa != null && Object.hasOwnProperty.call(message, "infoPerMsoa"))
                for (let keys = Object.keys(message.infoPerMsoa), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.synthpop.InfoPerMSOA.encode(message.infoPerMsoa[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            $root.synthpop.Lockdown.encode(message.lockdown, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.timeUseDiaries != null && message.timeUseDiaries.length)
                for (let i = 0; i < message.timeUseDiaries.length; ++i)
                    $root.synthpop.TimeUseDiary.encode(message.timeUseDiaries[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.year);
            return writer;
        };

        /**
         * Encodes the specified Population message, length delimited. Does not implicitly {@link synthpop.Population.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Population
         * @static
         * @param {synthpop.IPopulation} message Population message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Population.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Population message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Population
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Population} Population
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Population.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Population(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.households && message.households.length))
                            message.households = [];
                        message.households.push($root.synthpop.Household.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        if (!(message.people && message.people.length))
                            message.people = [];
                        message.people.push($root.synthpop.Person.decode(reader, reader.uint32()));
                        break;
                    }
                case 3: {
                        if (message.venuesPerActivity === $util.emptyObject)
                            message.venuesPerActivity = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = 0;
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.int32();
                                break;
                            case 2:
                                value = $root.synthpop.VenueList.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.venuesPerActivity[key] = value;
                        break;
                    }
                case 4: {
                        if (message.infoPerMsoa === $util.emptyObject)
                            message.infoPerMsoa = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.synthpop.InfoPerMSOA.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.infoPerMsoa[key] = value;
                        break;
                    }
                case 5: {
                        message.lockdown = $root.synthpop.Lockdown.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        if (!(message.timeUseDiaries && message.timeUseDiaries.length))
                            message.timeUseDiaries = [];
                        message.timeUseDiaries.push($root.synthpop.TimeUseDiary.decode(reader, reader.uint32()));
                        break;
                    }
                case 7: {
                        message.year = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("lockdown"))
                throw $util.ProtocolError("missing required 'lockdown'", { instance: message });
            if (!message.hasOwnProperty("year"))
                throw $util.ProtocolError("missing required 'year'", { instance: message });
            return message;
        };

        /**
         * Decodes a Population message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Population
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Population} Population
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Population.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Population message.
         * @function verify
         * @memberof synthpop.Population
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Population.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.households != null && message.hasOwnProperty("households")) {
                if (!Array.isArray(message.households))
                    return "households: array expected";
                for (let i = 0; i < message.households.length; ++i) {
                    let error = $root.synthpop.Household.verify(message.households[i]);
                    if (error)
                        return "households." + error;
                }
            }
            if (message.people != null && message.hasOwnProperty("people")) {
                if (!Array.isArray(message.people))
                    return "people: array expected";
                for (let i = 0; i < message.people.length; ++i) {
                    let error = $root.synthpop.Person.verify(message.people[i]);
                    if (error)
                        return "people." + error;
                }
            }
            if (message.venuesPerActivity != null && message.hasOwnProperty("venuesPerActivity")) {
                if (!$util.isObject(message.venuesPerActivity))
                    return "venuesPerActivity: object expected";
                let key = Object.keys(message.venuesPerActivity);
                for (let i = 0; i < key.length; ++i) {
                    if (!$util.key32Re.test(key[i]))
                        return "venuesPerActivity: integer key{k:int32} expected";
                    {
                        let error = $root.synthpop.VenueList.verify(message.venuesPerActivity[key[i]]);
                        if (error)
                            return "venuesPerActivity." + error;
                    }
                }
            }
            if (message.infoPerMsoa != null && message.hasOwnProperty("infoPerMsoa")) {
                if (!$util.isObject(message.infoPerMsoa))
                    return "infoPerMsoa: object expected";
                let key = Object.keys(message.infoPerMsoa);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.synthpop.InfoPerMSOA.verify(message.infoPerMsoa[key[i]]);
                    if (error)
                        return "infoPerMsoa." + error;
                }
            }
            {
                let error = $root.synthpop.Lockdown.verify(message.lockdown);
                if (error)
                    return "lockdown." + error;
            }
            if (message.timeUseDiaries != null && message.hasOwnProperty("timeUseDiaries")) {
                if (!Array.isArray(message.timeUseDiaries))
                    return "timeUseDiaries: array expected";
                for (let i = 0; i < message.timeUseDiaries.length; ++i) {
                    let error = $root.synthpop.TimeUseDiary.verify(message.timeUseDiaries[i]);
                    if (error)
                        return "timeUseDiaries." + error;
                }
            }
            if (!$util.isInteger(message.year))
                return "year: integer expected";
            return null;
        };

        /**
         * Creates a Population message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Population
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Population} Population
         */
        Population.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Population)
                return object;
            let message = new $root.synthpop.Population();
            if (object.households) {
                if (!Array.isArray(object.households))
                    throw TypeError(".synthpop.Population.households: array expected");
                message.households = [];
                for (let i = 0; i < object.households.length; ++i) {
                    if (typeof object.households[i] !== "object")
                        throw TypeError(".synthpop.Population.households: object expected");
                    message.households[i] = $root.synthpop.Household.fromObject(object.households[i]);
                }
            }
            if (object.people) {
                if (!Array.isArray(object.people))
                    throw TypeError(".synthpop.Population.people: array expected");
                message.people = [];
                for (let i = 0; i < object.people.length; ++i) {
                    if (typeof object.people[i] !== "object")
                        throw TypeError(".synthpop.Population.people: object expected");
                    message.people[i] = $root.synthpop.Person.fromObject(object.people[i]);
                }
            }
            if (object.venuesPerActivity) {
                if (typeof object.venuesPerActivity !== "object")
                    throw TypeError(".synthpop.Population.venuesPerActivity: object expected");
                message.venuesPerActivity = {};
                for (let keys = Object.keys(object.venuesPerActivity), i = 0; i < keys.length; ++i) {
                    if (typeof object.venuesPerActivity[keys[i]] !== "object")
                        throw TypeError(".synthpop.Population.venuesPerActivity: object expected");
                    message.venuesPerActivity[keys[i]] = $root.synthpop.VenueList.fromObject(object.venuesPerActivity[keys[i]]);
                }
            }
            if (object.infoPerMsoa) {
                if (typeof object.infoPerMsoa !== "object")
                    throw TypeError(".synthpop.Population.infoPerMsoa: object expected");
                message.infoPerMsoa = {};
                for (let keys = Object.keys(object.infoPerMsoa), i = 0; i < keys.length; ++i) {
                    if (typeof object.infoPerMsoa[keys[i]] !== "object")
                        throw TypeError(".synthpop.Population.infoPerMsoa: object expected");
                    message.infoPerMsoa[keys[i]] = $root.synthpop.InfoPerMSOA.fromObject(object.infoPerMsoa[keys[i]]);
                }
            }
            if (object.lockdown != null) {
                if (typeof object.lockdown !== "object")
                    throw TypeError(".synthpop.Population.lockdown: object expected");
                message.lockdown = $root.synthpop.Lockdown.fromObject(object.lockdown);
            }
            if (object.timeUseDiaries) {
                if (!Array.isArray(object.timeUseDiaries))
                    throw TypeError(".synthpop.Population.timeUseDiaries: array expected");
                message.timeUseDiaries = [];
                for (let i = 0; i < object.timeUseDiaries.length; ++i) {
                    if (typeof object.timeUseDiaries[i] !== "object")
                        throw TypeError(".synthpop.Population.timeUseDiaries: object expected");
                    message.timeUseDiaries[i] = $root.synthpop.TimeUseDiary.fromObject(object.timeUseDiaries[i]);
                }
            }
            if (object.year != null)
                message.year = object.year >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a Population message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Population
         * @static
         * @param {synthpop.Population} message Population
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Population.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.households = [];
                object.people = [];
                object.timeUseDiaries = [];
            }
            if (options.objects || options.defaults) {
                object.venuesPerActivity = {};
                object.infoPerMsoa = {};
            }
            if (options.defaults) {
                object.lockdown = null;
                object.year = 0;
            }
            if (message.households && message.households.length) {
                object.households = [];
                for (let j = 0; j < message.households.length; ++j)
                    object.households[j] = $root.synthpop.Household.toObject(message.households[j], options);
            }
            if (message.people && message.people.length) {
                object.people = [];
                for (let j = 0; j < message.people.length; ++j)
                    object.people[j] = $root.synthpop.Person.toObject(message.people[j], options);
            }
            let keys2;
            if (message.venuesPerActivity && (keys2 = Object.keys(message.venuesPerActivity)).length) {
                object.venuesPerActivity = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.venuesPerActivity[keys2[j]] = $root.synthpop.VenueList.toObject(message.venuesPerActivity[keys2[j]], options);
            }
            if (message.infoPerMsoa && (keys2 = Object.keys(message.infoPerMsoa)).length) {
                object.infoPerMsoa = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.infoPerMsoa[keys2[j]] = $root.synthpop.InfoPerMSOA.toObject(message.infoPerMsoa[keys2[j]], options);
            }
            if (message.lockdown != null && message.hasOwnProperty("lockdown"))
                object.lockdown = $root.synthpop.Lockdown.toObject(message.lockdown, options);
            if (message.timeUseDiaries && message.timeUseDiaries.length) {
                object.timeUseDiaries = [];
                for (let j = 0; j < message.timeUseDiaries.length; ++j)
                    object.timeUseDiaries[j] = $root.synthpop.TimeUseDiary.toObject(message.timeUseDiaries[j], options);
            }
            if (message.year != null && message.hasOwnProperty("year"))
                object.year = message.year;
            return object;
        };

        /**
         * Converts this Population to JSON.
         * @function toJSON
         * @memberof synthpop.Population
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Population.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Population
         * @function getTypeUrl
         * @memberof synthpop.Population
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Population.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Population";
        };

        return Population;
    })();

    synthpop.Household = (function() {

        /**
         * Properties of an Household.
         * @memberof synthpop
         * @interface IHousehold
         * @property {number|Long} id Household id
         * @property {string} msoa11cd Household msoa11cd
         * @property {string} oa11cd Household oa11cd
         * @property {Array.<number|Long>|null} [members] Household members
         * @property {synthpop.IHouseholdDetails} details Household details
         */

        /**
         * Constructs a new Household.
         * @memberof synthpop
         * @classdesc Represents an Household.
         * @implements IHousehold
         * @constructor
         * @param {synthpop.IHousehold=} [properties] Properties to set
         */
        function Household(properties) {
            this.members = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Household id.
         * @member {number|Long} id
         * @memberof synthpop.Household
         * @instance
         */
        Household.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Household msoa11cd.
         * @member {string} msoa11cd
         * @memberof synthpop.Household
         * @instance
         */
        Household.prototype.msoa11cd = "";

        /**
         * Household oa11cd.
         * @member {string} oa11cd
         * @memberof synthpop.Household
         * @instance
         */
        Household.prototype.oa11cd = "";

        /**
         * Household members.
         * @member {Array.<number|Long>} members
         * @memberof synthpop.Household
         * @instance
         */
        Household.prototype.members = $util.emptyArray;

        /**
         * Household details.
         * @member {synthpop.IHouseholdDetails} details
         * @memberof synthpop.Household
         * @instance
         */
        Household.prototype.details = null;

        /**
         * Creates a new Household instance using the specified properties.
         * @function create
         * @memberof synthpop.Household
         * @static
         * @param {synthpop.IHousehold=} [properties] Properties to set
         * @returns {synthpop.Household} Household instance
         */
        Household.create = function create(properties) {
            return new Household(properties);
        };

        /**
         * Encodes the specified Household message. Does not implicitly {@link synthpop.Household.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Household
         * @static
         * @param {synthpop.IHousehold} message Household message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Household.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.msoa11cd);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.oa11cd);
            if (message.members != null && message.members.length)
                for (let i = 0; i < message.members.length; ++i)
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.members[i]);
            $root.synthpop.HouseholdDetails.encode(message.details, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Household message, length delimited. Does not implicitly {@link synthpop.Household.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Household
         * @static
         * @param {synthpop.IHousehold} message Household message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Household.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Household message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Household
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Household} Household
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Household.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Household();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.msoa11cd = reader.string();
                        break;
                    }
                case 3: {
                        message.oa11cd = reader.string();
                        break;
                    }
                case 4: {
                        if (!(message.members && message.members.length))
                            message.members = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.members.push(reader.uint64());
                        } else
                            message.members.push(reader.uint64());
                        break;
                    }
                case 5: {
                        message.details = $root.synthpop.HouseholdDetails.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("msoa11cd"))
                throw $util.ProtocolError("missing required 'msoa11cd'", { instance: message });
            if (!message.hasOwnProperty("oa11cd"))
                throw $util.ProtocolError("missing required 'oa11cd'", { instance: message });
            if (!message.hasOwnProperty("details"))
                throw $util.ProtocolError("missing required 'details'", { instance: message });
            return message;
        };

        /**
         * Decodes an Household message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Household
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Household} Household
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Household.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Household message.
         * @function verify
         * @memberof synthpop.Household
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Household.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                return "id: integer|Long expected";
            if (!$util.isString(message.msoa11cd))
                return "msoa11cd: string expected";
            if (!$util.isString(message.oa11cd))
                return "oa11cd: string expected";
            if (message.members != null && message.hasOwnProperty("members")) {
                if (!Array.isArray(message.members))
                    return "members: array expected";
                for (let i = 0; i < message.members.length; ++i)
                    if (!$util.isInteger(message.members[i]) && !(message.members[i] && $util.isInteger(message.members[i].low) && $util.isInteger(message.members[i].high)))
                        return "members: integer|Long[] expected";
            }
            {
                let error = $root.synthpop.HouseholdDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            return null;
        };

        /**
         * Creates an Household message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Household
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Household} Household
         */
        Household.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Household)
                return object;
            let message = new $root.synthpop.Household();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.msoa11cd != null)
                message.msoa11cd = String(object.msoa11cd);
            if (object.oa11cd != null)
                message.oa11cd = String(object.oa11cd);
            if (object.members) {
                if (!Array.isArray(object.members))
                    throw TypeError(".synthpop.Household.members: array expected");
                message.members = [];
                for (let i = 0; i < object.members.length; ++i)
                    if ($util.Long)
                        (message.members[i] = $util.Long.fromValue(object.members[i])).unsigned = true;
                    else if (typeof object.members[i] === "string")
                        message.members[i] = parseInt(object.members[i], 10);
                    else if (typeof object.members[i] === "number")
                        message.members[i] = object.members[i];
                    else if (typeof object.members[i] === "object")
                        message.members[i] = new $util.LongBits(object.members[i].low >>> 0, object.members[i].high >>> 0).toNumber(true);
            }
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".synthpop.Household.details: object expected");
                message.details = $root.synthpop.HouseholdDetails.fromObject(object.details);
            }
            return message;
        };

        /**
         * Creates a plain object from an Household message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Household
         * @static
         * @param {synthpop.Household} message Household
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Household.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.members = [];
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.msoa11cd = "";
                object.oa11cd = "";
                object.details = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.msoa11cd != null && message.hasOwnProperty("msoa11cd"))
                object.msoa11cd = message.msoa11cd;
            if (message.oa11cd != null && message.hasOwnProperty("oa11cd"))
                object.oa11cd = message.oa11cd;
            if (message.members && message.members.length) {
                object.members = [];
                for (let j = 0; j < message.members.length; ++j)
                    if (typeof message.members[j] === "number")
                        object.members[j] = options.longs === String ? String(message.members[j]) : message.members[j];
                    else
                        object.members[j] = options.longs === String ? $util.Long.prototype.toString.call(message.members[j]) : options.longs === Number ? new $util.LongBits(message.members[j].low >>> 0, message.members[j].high >>> 0).toNumber(true) : message.members[j];
            }
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.synthpop.HouseholdDetails.toObject(message.details, options);
            return object;
        };

        /**
         * Converts this Household to JSON.
         * @function toJSON
         * @memberof synthpop.Household
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Household.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Household
         * @function getTypeUrl
         * @memberof synthpop.Household
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Household.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Household";
        };

        return Household;
    })();

    synthpop.HouseholdDetails = (function() {

        /**
         * Properties of an HouseholdDetails.
         * @memberof synthpop
         * @interface IHouseholdDetails
         * @property {string} hid Unique household ID
         * @property {synthpop.Nssec8|null} [nssec8] HouseholdDetails nssec8
         * @property {synthpop.AccommodationType|null} [accommodationType] HouseholdDetails accommodationType
         * @property {synthpop.CommunalType|null} [communalType] HouseholdDetails communalType
         * @property {number|Long|null} [numRooms] HouseholdDetails numRooms
         * @property {boolean} centralHeat HouseholdDetails centralHeat
         * @property {synthpop.Tenure|null} [tenure] HouseholdDetails tenure
         * @property {number|Long|null} [numCars] HouseholdDetails numCars
         */

        /**
         * Constructs a new HouseholdDetails.
         * @memberof synthpop
         * @classdesc Represents an HouseholdDetails.
         * @implements IHouseholdDetails
         * @constructor
         * @param {synthpop.IHouseholdDetails=} [properties] Properties to set
         */
        function HouseholdDetails(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Unique household ID
         * @member {string} hid
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.hid = "";

        /**
         * HouseholdDetails nssec8.
         * @member {synthpop.Nssec8} nssec8
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.nssec8 = 1;

        /**
         * HouseholdDetails accommodationType.
         * @member {synthpop.AccommodationType} accommodationType
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.accommodationType = 1;

        /**
         * HouseholdDetails communalType.
         * @member {synthpop.CommunalType} communalType
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.communalType = 0;

        /**
         * HouseholdDetails numRooms.
         * @member {number|Long} numRooms
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.numRooms = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * HouseholdDetails centralHeat.
         * @member {boolean} centralHeat
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.centralHeat = false;

        /**
         * HouseholdDetails tenure.
         * @member {synthpop.Tenure} tenure
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.tenure = 1;

        /**
         * HouseholdDetails numCars.
         * @member {number|Long} numCars
         * @memberof synthpop.HouseholdDetails
         * @instance
         */
        HouseholdDetails.prototype.numCars = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new HouseholdDetails instance using the specified properties.
         * @function create
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {synthpop.IHouseholdDetails=} [properties] Properties to set
         * @returns {synthpop.HouseholdDetails} HouseholdDetails instance
         */
        HouseholdDetails.create = function create(properties) {
            return new HouseholdDetails(properties);
        };

        /**
         * Encodes the specified HouseholdDetails message. Does not implicitly {@link synthpop.HouseholdDetails.verify|verify} messages.
         * @function encode
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {synthpop.IHouseholdDetails} message HouseholdDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HouseholdDetails.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.hid);
            if (message.nssec8 != null && Object.hasOwnProperty.call(message, "nssec8"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nssec8);
            if (message.accommodationType != null && Object.hasOwnProperty.call(message, "accommodationType"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.accommodationType);
            if (message.communalType != null && Object.hasOwnProperty.call(message, "communalType"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.communalType);
            if (message.numRooms != null && Object.hasOwnProperty.call(message, "numRooms"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.numRooms);
            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.centralHeat);
            if (message.tenure != null && Object.hasOwnProperty.call(message, "tenure"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.tenure);
            if (message.numCars != null && Object.hasOwnProperty.call(message, "numCars"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.numCars);
            return writer;
        };

        /**
         * Encodes the specified HouseholdDetails message, length delimited. Does not implicitly {@link synthpop.HouseholdDetails.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {synthpop.IHouseholdDetails} message HouseholdDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HouseholdDetails.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an HouseholdDetails message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.HouseholdDetails} HouseholdDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HouseholdDetails.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.HouseholdDetails();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.hid = reader.string();
                        break;
                    }
                case 2: {
                        message.nssec8 = reader.int32();
                        break;
                    }
                case 3: {
                        message.accommodationType = reader.int32();
                        break;
                    }
                case 4: {
                        message.communalType = reader.int32();
                        break;
                    }
                case 5: {
                        message.numRooms = reader.uint64();
                        break;
                    }
                case 6: {
                        message.centralHeat = reader.bool();
                        break;
                    }
                case 7: {
                        message.tenure = reader.int32();
                        break;
                    }
                case 8: {
                        message.numCars = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("hid"))
                throw $util.ProtocolError("missing required 'hid'", { instance: message });
            if (!message.hasOwnProperty("centralHeat"))
                throw $util.ProtocolError("missing required 'centralHeat'", { instance: message });
            return message;
        };

        /**
         * Decodes an HouseholdDetails message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.HouseholdDetails} HouseholdDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HouseholdDetails.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an HouseholdDetails message.
         * @function verify
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        HouseholdDetails.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.hid))
                return "hid: string expected";
            if (message.nssec8 != null && message.hasOwnProperty("nssec8"))
                switch (message.nssec8) {
                default:
                    return "nssec8: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.accommodationType != null && message.hasOwnProperty("accommodationType"))
                switch (message.accommodationType) {
                default:
                    return "accommodationType: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.communalType != null && message.hasOwnProperty("communalType"))
                switch (message.communalType) {
                default:
                    return "communalType: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                case 29:
                case 30:
                case 31:
                case 32:
                case 33:
                case 34:
                    break;
                }
            if (message.numRooms != null && message.hasOwnProperty("numRooms"))
                if (!$util.isInteger(message.numRooms) && !(message.numRooms && $util.isInteger(message.numRooms.low) && $util.isInteger(message.numRooms.high)))
                    return "numRooms: integer|Long expected";
            if (typeof message.centralHeat !== "boolean")
                return "centralHeat: boolean expected";
            if (message.tenure != null && message.hasOwnProperty("tenure"))
                switch (message.tenure) {
                default:
                    return "tenure: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.numCars != null && message.hasOwnProperty("numCars"))
                if (!$util.isInteger(message.numCars) && !(message.numCars && $util.isInteger(message.numCars.low) && $util.isInteger(message.numCars.high)))
                    return "numCars: integer|Long expected";
            return null;
        };

        /**
         * Creates an HouseholdDetails message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.HouseholdDetails} HouseholdDetails
         */
        HouseholdDetails.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.HouseholdDetails)
                return object;
            let message = new $root.synthpop.HouseholdDetails();
            if (object.hid != null)
                message.hid = String(object.hid);
            switch (object.nssec8) {
            default:
                if (typeof object.nssec8 === "number") {
                    message.nssec8 = object.nssec8;
                    break;
                }
                break;
            case "HIGHER":
            case 1:
                message.nssec8 = 1;
                break;
            case "LOWER":
            case 2:
                message.nssec8 = 2;
                break;
            case "INTERMEDIATE":
            case 3:
                message.nssec8 = 3;
                break;
            case "SMALL":
            case 4:
                message.nssec8 = 4;
                break;
            case "SUPER":
            case 5:
                message.nssec8 = 5;
                break;
            case "SEMIROUTINE":
            case 6:
                message.nssec8 = 6;
                break;
            case "ROUTINE":
            case 7:
                message.nssec8 = 7;
                break;
            case "NEVER":
            case 8:
                message.nssec8 = 8;
                break;
            }
            switch (object.accommodationType) {
            default:
                if (typeof object.accommodationType === "number") {
                    message.accommodationType = object.accommodationType;
                    break;
                }
                break;
            case "DETACHED":
            case 1:
                message.accommodationType = 1;
                break;
            case "SEMI_DETACHED":
            case 2:
                message.accommodationType = 2;
                break;
            case "TERRACED":
            case 3:
                message.accommodationType = 3;
                break;
            case "FLAT":
            case 4:
                message.accommodationType = 4;
                break;
            }
            switch (object.communalType) {
            default:
                if (typeof object.communalType === "number") {
                    message.communalType = object.communalType;
                    break;
                }
                break;
            case "COMMUNAL":
            case 0:
                message.communalType = 0;
                break;
            case "MEDICAL":
            case 1:
                message.communalType = 1;
                break;
            case "MEDICAL_NHS":
            case 2:
                message.communalType = 2;
                break;
            case "MEDICAL_NHS_HOSPITAL":
            case 3:
                message.communalType = 3;
                break;
            case "MEDICAL_NHS_MENTAL":
            case 4:
                message.communalType = 4;
                break;
            case "MEDICAL_NHS_OTHER":
            case 5:
                message.communalType = 5;
                break;
            case "MEDICAL_LA":
            case 6:
                message.communalType = 6;
                break;
            case "MEDICAL_LA_CHILDREN":
            case 7:
                message.communalType = 7;
                break;
            case "MEDICAL_LA_CARE_HOME_NURSING":
            case 8:
                message.communalType = 8;
                break;
            case "MEDICAL_LA_CARE_HOME_NO_NURSING":
            case 9:
                message.communalType = 9;
                break;
            case "MEDICAL_LA_OTHER":
            case 10:
                message.communalType = 10;
                break;
            case "MEDICAL_SOCIAL":
            case 11:
                message.communalType = 11;
                break;
            case "MEDICAL_SOCIAL_HOSTEL":
            case 12:
                message.communalType = 12;
                break;
            case "MEDICAL_SOCIAL_SHELTER":
            case 13:
                message.communalType = 13;
                break;
            case "MEDICAL_OTHER":
            case 14:
                message.communalType = 14;
                break;
            case "MEDICAL_OTHER_CARE_HOME_NURSING":
            case 15:
                message.communalType = 15;
                break;
            case "MEDICAL_OTHER_CARE_HOME_NO_NURSING":
            case 16:
                message.communalType = 16;
                break;
            case "MEDICAL_OTHER_CHILDREN":
            case 17:
                message.communalType = 17;
                break;
            case "MEDICAL_OTHER_MENTAL":
            case 18:
                message.communalType = 18;
                break;
            case "MEDICAL_OTHER_HOSPITAL":
            case 19:
                message.communalType = 19;
                break;
            case "MEDICAL_OTHER_OTHER":
            case 20:
                message.communalType = 20;
                break;
            case "COM_OTHER":
            case 21:
                message.communalType = 21;
                break;
            case "DEFENSE":
            case 22:
                message.communalType = 22;
                break;
            case "PRISON":
            case 23:
                message.communalType = 23;
                break;
            case "PROBATION":
            case 24:
                message.communalType = 24;
                break;
            case "DETENTION":
            case 25:
                message.communalType = 25;
                break;
            case "EDUCATION":
            case 26:
                message.communalType = 26;
                break;
            case "HOTEL":
            case 27:
                message.communalType = 27;
                break;
            case "HOSTEL":
            case 28:
                message.communalType = 28;
                break;
            case "HOLIDAY":
            case 29:
                message.communalType = 29;
                break;
            case "TRAVEL":
            case 30:
                message.communalType = 30;
                break;
            case "RELIGIOUS":
            case 31:
                message.communalType = 31;
                break;
            case "STAFF":
            case 32:
                message.communalType = 32;
                break;
            case "OTHER_OTHER":
            case 33:
                message.communalType = 33;
                break;
            case "NOT_STATED":
            case 34:
                message.communalType = 34;
                break;
            }
            if (object.numRooms != null)
                if ($util.Long)
                    (message.numRooms = $util.Long.fromValue(object.numRooms)).unsigned = true;
                else if (typeof object.numRooms === "string")
                    message.numRooms = parseInt(object.numRooms, 10);
                else if (typeof object.numRooms === "number")
                    message.numRooms = object.numRooms;
                else if (typeof object.numRooms === "object")
                    message.numRooms = new $util.LongBits(object.numRooms.low >>> 0, object.numRooms.high >>> 0).toNumber(true);
            if (object.centralHeat != null)
                message.centralHeat = Boolean(object.centralHeat);
            switch (object.tenure) {
            default:
                if (typeof object.tenure === "number") {
                    message.tenure = object.tenure;
                    break;
                }
                break;
            case "OWNED_FULLY":
            case 1:
                message.tenure = 1;
                break;
            case "OWNED_MORTGAGE":
            case 2:
                message.tenure = 2;
                break;
            case "RENTED_FREE":
            case 3:
                message.tenure = 3;
                break;
            case "RENTED_SOCIAL":
            case 4:
                message.tenure = 4;
                break;
            case "RENTED_PRIVATE":
            case 5:
                message.tenure = 5;
                break;
            }
            if (object.numCars != null)
                if ($util.Long)
                    (message.numCars = $util.Long.fromValue(object.numCars)).unsigned = true;
                else if (typeof object.numCars === "string")
                    message.numCars = parseInt(object.numCars, 10);
                else if (typeof object.numCars === "number")
                    message.numCars = object.numCars;
                else if (typeof object.numCars === "object")
                    message.numCars = new $util.LongBits(object.numCars.low >>> 0, object.numCars.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from an HouseholdDetails message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {synthpop.HouseholdDetails} message HouseholdDetails
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        HouseholdDetails.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.hid = "";
                object.nssec8 = options.enums === String ? "HIGHER" : 1;
                object.accommodationType = options.enums === String ? "DETACHED" : 1;
                object.communalType = options.enums === String ? "COMMUNAL" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.numRooms = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.numRooms = options.longs === String ? "0" : 0;
                object.centralHeat = false;
                object.tenure = options.enums === String ? "OWNED_FULLY" : 1;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.numCars = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.numCars = options.longs === String ? "0" : 0;
            }
            if (message.hid != null && message.hasOwnProperty("hid"))
                object.hid = message.hid;
            if (message.nssec8 != null && message.hasOwnProperty("nssec8"))
                object.nssec8 = options.enums === String ? $root.synthpop.Nssec8[message.nssec8] === undefined ? message.nssec8 : $root.synthpop.Nssec8[message.nssec8] : message.nssec8;
            if (message.accommodationType != null && message.hasOwnProperty("accommodationType"))
                object.accommodationType = options.enums === String ? $root.synthpop.AccommodationType[message.accommodationType] === undefined ? message.accommodationType : $root.synthpop.AccommodationType[message.accommodationType] : message.accommodationType;
            if (message.communalType != null && message.hasOwnProperty("communalType"))
                object.communalType = options.enums === String ? $root.synthpop.CommunalType[message.communalType] === undefined ? message.communalType : $root.synthpop.CommunalType[message.communalType] : message.communalType;
            if (message.numRooms != null && message.hasOwnProperty("numRooms"))
                if (typeof message.numRooms === "number")
                    object.numRooms = options.longs === String ? String(message.numRooms) : message.numRooms;
                else
                    object.numRooms = options.longs === String ? $util.Long.prototype.toString.call(message.numRooms) : options.longs === Number ? new $util.LongBits(message.numRooms.low >>> 0, message.numRooms.high >>> 0).toNumber(true) : message.numRooms;
            if (message.centralHeat != null && message.hasOwnProperty("centralHeat"))
                object.centralHeat = message.centralHeat;
            if (message.tenure != null && message.hasOwnProperty("tenure"))
                object.tenure = options.enums === String ? $root.synthpop.Tenure[message.tenure] === undefined ? message.tenure : $root.synthpop.Tenure[message.tenure] : message.tenure;
            if (message.numCars != null && message.hasOwnProperty("numCars"))
                if (typeof message.numCars === "number")
                    object.numCars = options.longs === String ? String(message.numCars) : message.numCars;
                else
                    object.numCars = options.longs === String ? $util.Long.prototype.toString.call(message.numCars) : options.longs === Number ? new $util.LongBits(message.numCars.low >>> 0, message.numCars.high >>> 0).toNumber(true) : message.numCars;
            return object;
        };

        /**
         * Converts this HouseholdDetails to JSON.
         * @function toJSON
         * @memberof synthpop.HouseholdDetails
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        HouseholdDetails.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for HouseholdDetails
         * @function getTypeUrl
         * @memberof synthpop.HouseholdDetails
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        HouseholdDetails.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.HouseholdDetails";
        };

        return HouseholdDetails;
    })();

    synthpop.VenueList = (function() {

        /**
         * Properties of a VenueList.
         * @memberof synthpop
         * @interface IVenueList
         * @property {Array.<synthpop.IVenue>|null} [venues] VenueList venues
         */

        /**
         * Constructs a new VenueList.
         * @memberof synthpop
         * @classdesc Represents a VenueList.
         * @implements IVenueList
         * @constructor
         * @param {synthpop.IVenueList=} [properties] Properties to set
         */
        function VenueList(properties) {
            this.venues = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * VenueList venues.
         * @member {Array.<synthpop.IVenue>} venues
         * @memberof synthpop.VenueList
         * @instance
         */
        VenueList.prototype.venues = $util.emptyArray;

        /**
         * Creates a new VenueList instance using the specified properties.
         * @function create
         * @memberof synthpop.VenueList
         * @static
         * @param {synthpop.IVenueList=} [properties] Properties to set
         * @returns {synthpop.VenueList} VenueList instance
         */
        VenueList.create = function create(properties) {
            return new VenueList(properties);
        };

        /**
         * Encodes the specified VenueList message. Does not implicitly {@link synthpop.VenueList.verify|verify} messages.
         * @function encode
         * @memberof synthpop.VenueList
         * @static
         * @param {synthpop.IVenueList} message VenueList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VenueList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.venues != null && message.venues.length)
                for (let i = 0; i < message.venues.length; ++i)
                    $root.synthpop.Venue.encode(message.venues[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified VenueList message, length delimited. Does not implicitly {@link synthpop.VenueList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.VenueList
         * @static
         * @param {synthpop.IVenueList} message VenueList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VenueList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a VenueList message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.VenueList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.VenueList} VenueList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VenueList.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.VenueList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.venues && message.venues.length))
                            message.venues = [];
                        message.venues.push($root.synthpop.Venue.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a VenueList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.VenueList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.VenueList} VenueList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VenueList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a VenueList message.
         * @function verify
         * @memberof synthpop.VenueList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        VenueList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.venues != null && message.hasOwnProperty("venues")) {
                if (!Array.isArray(message.venues))
                    return "venues: array expected";
                for (let i = 0; i < message.venues.length; ++i) {
                    let error = $root.synthpop.Venue.verify(message.venues[i]);
                    if (error)
                        return "venues." + error;
                }
            }
            return null;
        };

        /**
         * Creates a VenueList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.VenueList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.VenueList} VenueList
         */
        VenueList.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.VenueList)
                return object;
            let message = new $root.synthpop.VenueList();
            if (object.venues) {
                if (!Array.isArray(object.venues))
                    throw TypeError(".synthpop.VenueList.venues: array expected");
                message.venues = [];
                for (let i = 0; i < object.venues.length; ++i) {
                    if (typeof object.venues[i] !== "object")
                        throw TypeError(".synthpop.VenueList.venues: object expected");
                    message.venues[i] = $root.synthpop.Venue.fromObject(object.venues[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a VenueList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.VenueList
         * @static
         * @param {synthpop.VenueList} message VenueList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        VenueList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.venues = [];
            if (message.venues && message.venues.length) {
                object.venues = [];
                for (let j = 0; j < message.venues.length; ++j)
                    object.venues[j] = $root.synthpop.Venue.toObject(message.venues[j], options);
            }
            return object;
        };

        /**
         * Converts this VenueList to JSON.
         * @function toJSON
         * @memberof synthpop.VenueList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        VenueList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for VenueList
         * @function getTypeUrl
         * @memberof synthpop.VenueList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        VenueList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.VenueList";
        };

        return VenueList;
    })();

    synthpop.InfoPerMSOA = (function() {

        /**
         * Properties of an InfoPerMSOA.
         * @memberof synthpop
         * @interface IInfoPerMSOA
         * @property {Array.<synthpop.IPoint>|null} [shape] InfoPerMSOA shape
         * @property {number|Long} population InfoPerMSOA population
         * @property {Array.<synthpop.IPoint>|null} [buildings] InfoPerMSOA buildings
         * @property {Array.<synthpop.IFlows>|null} [flowsPerActivity] InfoPerMSOA flowsPerActivity
         */

        /**
         * Constructs a new InfoPerMSOA.
         * @memberof synthpop
         * @classdesc Represents an InfoPerMSOA.
         * @implements IInfoPerMSOA
         * @constructor
         * @param {synthpop.IInfoPerMSOA=} [properties] Properties to set
         */
        function InfoPerMSOA(properties) {
            this.shape = [];
            this.buildings = [];
            this.flowsPerActivity = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * InfoPerMSOA shape.
         * @member {Array.<synthpop.IPoint>} shape
         * @memberof synthpop.InfoPerMSOA
         * @instance
         */
        InfoPerMSOA.prototype.shape = $util.emptyArray;

        /**
         * InfoPerMSOA population.
         * @member {number|Long} population
         * @memberof synthpop.InfoPerMSOA
         * @instance
         */
        InfoPerMSOA.prototype.population = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * InfoPerMSOA buildings.
         * @member {Array.<synthpop.IPoint>} buildings
         * @memberof synthpop.InfoPerMSOA
         * @instance
         */
        InfoPerMSOA.prototype.buildings = $util.emptyArray;

        /**
         * InfoPerMSOA flowsPerActivity.
         * @member {Array.<synthpop.IFlows>} flowsPerActivity
         * @memberof synthpop.InfoPerMSOA
         * @instance
         */
        InfoPerMSOA.prototype.flowsPerActivity = $util.emptyArray;

        /**
         * Creates a new InfoPerMSOA instance using the specified properties.
         * @function create
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {synthpop.IInfoPerMSOA=} [properties] Properties to set
         * @returns {synthpop.InfoPerMSOA} InfoPerMSOA instance
         */
        InfoPerMSOA.create = function create(properties) {
            return new InfoPerMSOA(properties);
        };

        /**
         * Encodes the specified InfoPerMSOA message. Does not implicitly {@link synthpop.InfoPerMSOA.verify|verify} messages.
         * @function encode
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {synthpop.IInfoPerMSOA} message InfoPerMSOA message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InfoPerMSOA.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.shape != null && message.shape.length)
                for (let i = 0; i < message.shape.length; ++i)
                    $root.synthpop.Point.encode(message.shape[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.population);
            if (message.buildings != null && message.buildings.length)
                for (let i = 0; i < message.buildings.length; ++i)
                    $root.synthpop.Point.encode(message.buildings[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.flowsPerActivity != null && message.flowsPerActivity.length)
                for (let i = 0; i < message.flowsPerActivity.length; ++i)
                    $root.synthpop.Flows.encode(message.flowsPerActivity[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified InfoPerMSOA message, length delimited. Does not implicitly {@link synthpop.InfoPerMSOA.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {synthpop.IInfoPerMSOA} message InfoPerMSOA message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        InfoPerMSOA.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an InfoPerMSOA message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.InfoPerMSOA} InfoPerMSOA
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InfoPerMSOA.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.InfoPerMSOA();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.shape && message.shape.length))
                            message.shape = [];
                        message.shape.push($root.synthpop.Point.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.population = reader.uint64();
                        break;
                    }
                case 3: {
                        if (!(message.buildings && message.buildings.length))
                            message.buildings = [];
                        message.buildings.push($root.synthpop.Point.decode(reader, reader.uint32()));
                        break;
                    }
                case 4: {
                        if (!(message.flowsPerActivity && message.flowsPerActivity.length))
                            message.flowsPerActivity = [];
                        message.flowsPerActivity.push($root.synthpop.Flows.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("population"))
                throw $util.ProtocolError("missing required 'population'", { instance: message });
            return message;
        };

        /**
         * Decodes an InfoPerMSOA message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.InfoPerMSOA} InfoPerMSOA
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        InfoPerMSOA.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an InfoPerMSOA message.
         * @function verify
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        InfoPerMSOA.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.shape != null && message.hasOwnProperty("shape")) {
                if (!Array.isArray(message.shape))
                    return "shape: array expected";
                for (let i = 0; i < message.shape.length; ++i) {
                    let error = $root.synthpop.Point.verify(message.shape[i]);
                    if (error)
                        return "shape." + error;
                }
            }
            if (!$util.isInteger(message.population) && !(message.population && $util.isInteger(message.population.low) && $util.isInteger(message.population.high)))
                return "population: integer|Long expected";
            if (message.buildings != null && message.hasOwnProperty("buildings")) {
                if (!Array.isArray(message.buildings))
                    return "buildings: array expected";
                for (let i = 0; i < message.buildings.length; ++i) {
                    let error = $root.synthpop.Point.verify(message.buildings[i]);
                    if (error)
                        return "buildings." + error;
                }
            }
            if (message.flowsPerActivity != null && message.hasOwnProperty("flowsPerActivity")) {
                if (!Array.isArray(message.flowsPerActivity))
                    return "flowsPerActivity: array expected";
                for (let i = 0; i < message.flowsPerActivity.length; ++i) {
                    let error = $root.synthpop.Flows.verify(message.flowsPerActivity[i]);
                    if (error)
                        return "flowsPerActivity." + error;
                }
            }
            return null;
        };

        /**
         * Creates an InfoPerMSOA message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.InfoPerMSOA} InfoPerMSOA
         */
        InfoPerMSOA.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.InfoPerMSOA)
                return object;
            let message = new $root.synthpop.InfoPerMSOA();
            if (object.shape) {
                if (!Array.isArray(object.shape))
                    throw TypeError(".synthpop.InfoPerMSOA.shape: array expected");
                message.shape = [];
                for (let i = 0; i < object.shape.length; ++i) {
                    if (typeof object.shape[i] !== "object")
                        throw TypeError(".synthpop.InfoPerMSOA.shape: object expected");
                    message.shape[i] = $root.synthpop.Point.fromObject(object.shape[i]);
                }
            }
            if (object.population != null)
                if ($util.Long)
                    (message.population = $util.Long.fromValue(object.population)).unsigned = true;
                else if (typeof object.population === "string")
                    message.population = parseInt(object.population, 10);
                else if (typeof object.population === "number")
                    message.population = object.population;
                else if (typeof object.population === "object")
                    message.population = new $util.LongBits(object.population.low >>> 0, object.population.high >>> 0).toNumber(true);
            if (object.buildings) {
                if (!Array.isArray(object.buildings))
                    throw TypeError(".synthpop.InfoPerMSOA.buildings: array expected");
                message.buildings = [];
                for (let i = 0; i < object.buildings.length; ++i) {
                    if (typeof object.buildings[i] !== "object")
                        throw TypeError(".synthpop.InfoPerMSOA.buildings: object expected");
                    message.buildings[i] = $root.synthpop.Point.fromObject(object.buildings[i]);
                }
            }
            if (object.flowsPerActivity) {
                if (!Array.isArray(object.flowsPerActivity))
                    throw TypeError(".synthpop.InfoPerMSOA.flowsPerActivity: array expected");
                message.flowsPerActivity = [];
                for (let i = 0; i < object.flowsPerActivity.length; ++i) {
                    if (typeof object.flowsPerActivity[i] !== "object")
                        throw TypeError(".synthpop.InfoPerMSOA.flowsPerActivity: object expected");
                    message.flowsPerActivity[i] = $root.synthpop.Flows.fromObject(object.flowsPerActivity[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an InfoPerMSOA message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {synthpop.InfoPerMSOA} message InfoPerMSOA
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        InfoPerMSOA.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.shape = [];
                object.buildings = [];
                object.flowsPerActivity = [];
            }
            if (options.defaults)
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.population = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.population = options.longs === String ? "0" : 0;
            if (message.shape && message.shape.length) {
                object.shape = [];
                for (let j = 0; j < message.shape.length; ++j)
                    object.shape[j] = $root.synthpop.Point.toObject(message.shape[j], options);
            }
            if (message.population != null && message.hasOwnProperty("population"))
                if (typeof message.population === "number")
                    object.population = options.longs === String ? String(message.population) : message.population;
                else
                    object.population = options.longs === String ? $util.Long.prototype.toString.call(message.population) : options.longs === Number ? new $util.LongBits(message.population.low >>> 0, message.population.high >>> 0).toNumber(true) : message.population;
            if (message.buildings && message.buildings.length) {
                object.buildings = [];
                for (let j = 0; j < message.buildings.length; ++j)
                    object.buildings[j] = $root.synthpop.Point.toObject(message.buildings[j], options);
            }
            if (message.flowsPerActivity && message.flowsPerActivity.length) {
                object.flowsPerActivity = [];
                for (let j = 0; j < message.flowsPerActivity.length; ++j)
                    object.flowsPerActivity[j] = $root.synthpop.Flows.toObject(message.flowsPerActivity[j], options);
            }
            return object;
        };

        /**
         * Converts this InfoPerMSOA to JSON.
         * @function toJSON
         * @memberof synthpop.InfoPerMSOA
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        InfoPerMSOA.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for InfoPerMSOA
         * @function getTypeUrl
         * @memberof synthpop.InfoPerMSOA
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        InfoPerMSOA.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.InfoPerMSOA";
        };

        return InfoPerMSOA;
    })();

    synthpop.Point = (function() {

        /**
         * Properties of a Point.
         * @memberof synthpop
         * @interface IPoint
         * @property {number} longitude Point longitude
         * @property {number} latitude Point latitude
         */

        /**
         * Constructs a new Point.
         * @memberof synthpop
         * @classdesc Represents a Point.
         * @implements IPoint
         * @constructor
         * @param {synthpop.IPoint=} [properties] Properties to set
         */
        function Point(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Point longitude.
         * @member {number} longitude
         * @memberof synthpop.Point
         * @instance
         */
        Point.prototype.longitude = 0;

        /**
         * Point latitude.
         * @member {number} latitude
         * @memberof synthpop.Point
         * @instance
         */
        Point.prototype.latitude = 0;

        /**
         * Creates a new Point instance using the specified properties.
         * @function create
         * @memberof synthpop.Point
         * @static
         * @param {synthpop.IPoint=} [properties] Properties to set
         * @returns {synthpop.Point} Point instance
         */
        Point.create = function create(properties) {
            return new Point(properties);
        };

        /**
         * Encodes the specified Point message. Does not implicitly {@link synthpop.Point.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Point
         * @static
         * @param {synthpop.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Point.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.longitude);
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.latitude);
            return writer;
        };

        /**
         * Encodes the specified Point message, length delimited. Does not implicitly {@link synthpop.Point.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Point
         * @static
         * @param {synthpop.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Point.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Point message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Point.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Point();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.longitude = reader.float();
                        break;
                    }
                case 2: {
                        message.latitude = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("longitude"))
                throw $util.ProtocolError("missing required 'longitude'", { instance: message });
            if (!message.hasOwnProperty("latitude"))
                throw $util.ProtocolError("missing required 'latitude'", { instance: message });
            return message;
        };

        /**
         * Decodes a Point message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Point.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Point message.
         * @function verify
         * @memberof synthpop.Point
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Point.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (typeof message.longitude !== "number")
                return "longitude: number expected";
            if (typeof message.latitude !== "number")
                return "latitude: number expected";
            return null;
        };

        /**
         * Creates a Point message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Point
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Point} Point
         */
        Point.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Point)
                return object;
            let message = new $root.synthpop.Point();
            if (object.longitude != null)
                message.longitude = Number(object.longitude);
            if (object.latitude != null)
                message.latitude = Number(object.latitude);
            return message;
        };

        /**
         * Creates a plain object from a Point message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Point
         * @static
         * @param {synthpop.Point} message Point
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Point.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.longitude = 0;
                object.latitude = 0;
            }
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                object.longitude = options.json && !isFinite(message.longitude) ? String(message.longitude) : message.longitude;
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                object.latitude = options.json && !isFinite(message.latitude) ? String(message.latitude) : message.latitude;
            return object;
        };

        /**
         * Converts this Point to JSON.
         * @function toJSON
         * @memberof synthpop.Point
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Point.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Point
         * @function getTypeUrl
         * @memberof synthpop.Point
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Point.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Point";
        };

        return Point;
    })();

    synthpop.Person = (function() {

        /**
         * Properties of a Person.
         * @memberof synthpop
         * @interface IPerson
         * @property {number|Long} id Person id
         * @property {number|Long} household Person household
         * @property {number|Long|null} [workplace] Person workplace
         * @property {synthpop.IIdentifiers} identifiers Person identifiers
         * @property {synthpop.IDemographics} demographics Person demographics
         * @property {synthpop.IEmployment} employment Person employment
         * @property {synthpop.IHealth} health Person health
         * @property {synthpop.IEvents} events Person events
         * @property {Array.<number>|null} [weekdayDiaries] Person weekdayDiaries
         * @property {Array.<number>|null} [weekendDiaries] Person weekendDiaries
         */

        /**
         * Constructs a new Person.
         * @memberof synthpop
         * @classdesc Represents a Person.
         * @implements IPerson
         * @constructor
         * @param {synthpop.IPerson=} [properties] Properties to set
         */
        function Person(properties) {
            this.weekdayDiaries = [];
            this.weekendDiaries = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Person id.
         * @member {number|Long} id
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Person household.
         * @member {number|Long} household
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.household = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Person workplace.
         * @member {number|Long} workplace
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.workplace = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Person identifiers.
         * @member {synthpop.IIdentifiers} identifiers
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.identifiers = null;

        /**
         * Person demographics.
         * @member {synthpop.IDemographics} demographics
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.demographics = null;

        /**
         * Person employment.
         * @member {synthpop.IEmployment} employment
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.employment = null;

        /**
         * Person health.
         * @member {synthpop.IHealth} health
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.health = null;

        /**
         * Person events.
         * @member {synthpop.IEvents} events
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.events = null;

        /**
         * Person weekdayDiaries.
         * @member {Array.<number>} weekdayDiaries
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.weekdayDiaries = $util.emptyArray;

        /**
         * Person weekendDiaries.
         * @member {Array.<number>} weekendDiaries
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.weekendDiaries = $util.emptyArray;

        /**
         * Creates a new Person instance using the specified properties.
         * @function create
         * @memberof synthpop.Person
         * @static
         * @param {synthpop.IPerson=} [properties] Properties to set
         * @returns {synthpop.Person} Person instance
         */
        Person.create = function create(properties) {
            return new Person(properties);
        };

        /**
         * Encodes the specified Person message. Does not implicitly {@link synthpop.Person.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Person
         * @static
         * @param {synthpop.IPerson} message Person message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Person.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.household);
            if (message.workplace != null && Object.hasOwnProperty.call(message, "workplace"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.workplace);
            $root.synthpop.Identifiers.encode(message.identifiers, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            $root.synthpop.Demographics.encode(message.demographics, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            $root.synthpop.Employment.encode(message.employment, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            $root.synthpop.Health.encode(message.health, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            $root.synthpop.Events.encode(message.events, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.weekdayDiaries != null && message.weekdayDiaries.length)
                for (let i = 0; i < message.weekdayDiaries.length; ++i)
                    writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.weekdayDiaries[i]);
            if (message.weekendDiaries != null && message.weekendDiaries.length)
                for (let i = 0; i < message.weekendDiaries.length; ++i)
                    writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.weekendDiaries[i]);
            return writer;
        };

        /**
         * Encodes the specified Person message, length delimited. Does not implicitly {@link synthpop.Person.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Person
         * @static
         * @param {synthpop.IPerson} message Person message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Person.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Person message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Person
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Person} Person
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Person.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Person();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.household = reader.uint64();
                        break;
                    }
                case 3: {
                        message.workplace = reader.uint64();
                        break;
                    }
                case 4: {
                        message.identifiers = $root.synthpop.Identifiers.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.demographics = $root.synthpop.Demographics.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.employment = $root.synthpop.Employment.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.health = $root.synthpop.Health.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.events = $root.synthpop.Events.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        if (!(message.weekdayDiaries && message.weekdayDiaries.length))
                            message.weekdayDiaries = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.weekdayDiaries.push(reader.uint32());
                        } else
                            message.weekdayDiaries.push(reader.uint32());
                        break;
                    }
                case 10: {
                        if (!(message.weekendDiaries && message.weekendDiaries.length))
                            message.weekendDiaries = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.weekendDiaries.push(reader.uint32());
                        } else
                            message.weekendDiaries.push(reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("household"))
                throw $util.ProtocolError("missing required 'household'", { instance: message });
            if (!message.hasOwnProperty("identifiers"))
                throw $util.ProtocolError("missing required 'identifiers'", { instance: message });
            if (!message.hasOwnProperty("demographics"))
                throw $util.ProtocolError("missing required 'demographics'", { instance: message });
            if (!message.hasOwnProperty("employment"))
                throw $util.ProtocolError("missing required 'employment'", { instance: message });
            if (!message.hasOwnProperty("health"))
                throw $util.ProtocolError("missing required 'health'", { instance: message });
            if (!message.hasOwnProperty("events"))
                throw $util.ProtocolError("missing required 'events'", { instance: message });
            return message;
        };

        /**
         * Decodes a Person message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Person
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Person} Person
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Person.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Person message.
         * @function verify
         * @memberof synthpop.Person
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Person.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                return "id: integer|Long expected";
            if (!$util.isInteger(message.household) && !(message.household && $util.isInteger(message.household.low) && $util.isInteger(message.household.high)))
                return "household: integer|Long expected";
            if (message.workplace != null && message.hasOwnProperty("workplace"))
                if (!$util.isInteger(message.workplace) && !(message.workplace && $util.isInteger(message.workplace.low) && $util.isInteger(message.workplace.high)))
                    return "workplace: integer|Long expected";
            {
                let error = $root.synthpop.Identifiers.verify(message.identifiers);
                if (error)
                    return "identifiers." + error;
            }
            {
                let error = $root.synthpop.Demographics.verify(message.demographics);
                if (error)
                    return "demographics." + error;
            }
            {
                let error = $root.synthpop.Employment.verify(message.employment);
                if (error)
                    return "employment." + error;
            }
            {
                let error = $root.synthpop.Health.verify(message.health);
                if (error)
                    return "health." + error;
            }
            {
                let error = $root.synthpop.Events.verify(message.events);
                if (error)
                    return "events." + error;
            }
            if (message.weekdayDiaries != null && message.hasOwnProperty("weekdayDiaries")) {
                if (!Array.isArray(message.weekdayDiaries))
                    return "weekdayDiaries: array expected";
                for (let i = 0; i < message.weekdayDiaries.length; ++i)
                    if (!$util.isInteger(message.weekdayDiaries[i]))
                        return "weekdayDiaries: integer[] expected";
            }
            if (message.weekendDiaries != null && message.hasOwnProperty("weekendDiaries")) {
                if (!Array.isArray(message.weekendDiaries))
                    return "weekendDiaries: array expected";
                for (let i = 0; i < message.weekendDiaries.length; ++i)
                    if (!$util.isInteger(message.weekendDiaries[i]))
                        return "weekendDiaries: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a Person message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Person
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Person} Person
         */
        Person.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Person)
                return object;
            let message = new $root.synthpop.Person();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.household != null)
                if ($util.Long)
                    (message.household = $util.Long.fromValue(object.household)).unsigned = true;
                else if (typeof object.household === "string")
                    message.household = parseInt(object.household, 10);
                else if (typeof object.household === "number")
                    message.household = object.household;
                else if (typeof object.household === "object")
                    message.household = new $util.LongBits(object.household.low >>> 0, object.household.high >>> 0).toNumber(true);
            if (object.workplace != null)
                if ($util.Long)
                    (message.workplace = $util.Long.fromValue(object.workplace)).unsigned = true;
                else if (typeof object.workplace === "string")
                    message.workplace = parseInt(object.workplace, 10);
                else if (typeof object.workplace === "number")
                    message.workplace = object.workplace;
                else if (typeof object.workplace === "object")
                    message.workplace = new $util.LongBits(object.workplace.low >>> 0, object.workplace.high >>> 0).toNumber(true);
            if (object.identifiers != null) {
                if (typeof object.identifiers !== "object")
                    throw TypeError(".synthpop.Person.identifiers: object expected");
                message.identifiers = $root.synthpop.Identifiers.fromObject(object.identifiers);
            }
            if (object.demographics != null) {
                if (typeof object.demographics !== "object")
                    throw TypeError(".synthpop.Person.demographics: object expected");
                message.demographics = $root.synthpop.Demographics.fromObject(object.demographics);
            }
            if (object.employment != null) {
                if (typeof object.employment !== "object")
                    throw TypeError(".synthpop.Person.employment: object expected");
                message.employment = $root.synthpop.Employment.fromObject(object.employment);
            }
            if (object.health != null) {
                if (typeof object.health !== "object")
                    throw TypeError(".synthpop.Person.health: object expected");
                message.health = $root.synthpop.Health.fromObject(object.health);
            }
            if (object.events != null) {
                if (typeof object.events !== "object")
                    throw TypeError(".synthpop.Person.events: object expected");
                message.events = $root.synthpop.Events.fromObject(object.events);
            }
            if (object.weekdayDiaries) {
                if (!Array.isArray(object.weekdayDiaries))
                    throw TypeError(".synthpop.Person.weekdayDiaries: array expected");
                message.weekdayDiaries = [];
                for (let i = 0; i < object.weekdayDiaries.length; ++i)
                    message.weekdayDiaries[i] = object.weekdayDiaries[i] >>> 0;
            }
            if (object.weekendDiaries) {
                if (!Array.isArray(object.weekendDiaries))
                    throw TypeError(".synthpop.Person.weekendDiaries: array expected");
                message.weekendDiaries = [];
                for (let i = 0; i < object.weekendDiaries.length; ++i)
                    message.weekendDiaries[i] = object.weekendDiaries[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a Person message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Person
         * @static
         * @param {synthpop.Person} message Person
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Person.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.weekdayDiaries = [];
                object.weekendDiaries = [];
            }
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.household = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.household = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.workplace = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.workplace = options.longs === String ? "0" : 0;
                object.identifiers = null;
                object.demographics = null;
                object.employment = null;
                object.health = null;
                object.events = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.household != null && message.hasOwnProperty("household"))
                if (typeof message.household === "number")
                    object.household = options.longs === String ? String(message.household) : message.household;
                else
                    object.household = options.longs === String ? $util.Long.prototype.toString.call(message.household) : options.longs === Number ? new $util.LongBits(message.household.low >>> 0, message.household.high >>> 0).toNumber(true) : message.household;
            if (message.workplace != null && message.hasOwnProperty("workplace"))
                if (typeof message.workplace === "number")
                    object.workplace = options.longs === String ? String(message.workplace) : message.workplace;
                else
                    object.workplace = options.longs === String ? $util.Long.prototype.toString.call(message.workplace) : options.longs === Number ? new $util.LongBits(message.workplace.low >>> 0, message.workplace.high >>> 0).toNumber(true) : message.workplace;
            if (message.identifiers != null && message.hasOwnProperty("identifiers"))
                object.identifiers = $root.synthpop.Identifiers.toObject(message.identifiers, options);
            if (message.demographics != null && message.hasOwnProperty("demographics"))
                object.demographics = $root.synthpop.Demographics.toObject(message.demographics, options);
            if (message.employment != null && message.hasOwnProperty("employment"))
                object.employment = $root.synthpop.Employment.toObject(message.employment, options);
            if (message.health != null && message.hasOwnProperty("health"))
                object.health = $root.synthpop.Health.toObject(message.health, options);
            if (message.events != null && message.hasOwnProperty("events"))
                object.events = $root.synthpop.Events.toObject(message.events, options);
            if (message.weekdayDiaries && message.weekdayDiaries.length) {
                object.weekdayDiaries = [];
                for (let j = 0; j < message.weekdayDiaries.length; ++j)
                    object.weekdayDiaries[j] = message.weekdayDiaries[j];
            }
            if (message.weekendDiaries && message.weekendDiaries.length) {
                object.weekendDiaries = [];
                for (let j = 0; j < message.weekendDiaries.length; ++j)
                    object.weekendDiaries[j] = message.weekendDiaries[j];
            }
            return object;
        };

        /**
         * Converts this Person to JSON.
         * @function toJSON
         * @memberof synthpop.Person
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Person.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Person
         * @function getTypeUrl
         * @memberof synthpop.Person
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Person.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Person";
        };

        return Person;
    })();

    synthpop.Identifiers = (function() {

        /**
         * Properties of an Identifiers.
         * @memberof synthpop
         * @interface IIdentifiers
         * @property {string} origPid Unique person ID
         * @property {number|Long} idTusHh Identifiers idTusHh
         * @property {number|Long} idTusP Identifiers idTusP
         * @property {number|Long} pidHs Identifiers pidHs
         */

        /**
         * Constructs a new Identifiers.
         * @memberof synthpop
         * @classdesc Represents an Identifiers.
         * @implements IIdentifiers
         * @constructor
         * @param {synthpop.IIdentifiers=} [properties] Properties to set
         */
        function Identifiers(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Unique person ID
         * @member {string} origPid
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.origPid = "";

        /**
         * Identifiers idTusHh.
         * @member {number|Long} idTusHh
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.idTusHh = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Identifiers idTusP.
         * @member {number|Long} idTusP
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.idTusP = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Identifiers pidHs.
         * @member {number|Long} pidHs
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.pidHs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Identifiers instance using the specified properties.
         * @function create
         * @memberof synthpop.Identifiers
         * @static
         * @param {synthpop.IIdentifiers=} [properties] Properties to set
         * @returns {synthpop.Identifiers} Identifiers instance
         */
        Identifiers.create = function create(properties) {
            return new Identifiers(properties);
        };

        /**
         * Encodes the specified Identifiers message. Does not implicitly {@link synthpop.Identifiers.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Identifiers
         * @static
         * @param {synthpop.IIdentifiers} message Identifiers message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Identifiers.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.origPid);
            writer.uint32(/* id 2, wireType 0 =*/16).int64(message.idTusHh);
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.idTusP);
            writer.uint32(/* id 4, wireType 0 =*/32).int64(message.pidHs);
            return writer;
        };

        /**
         * Encodes the specified Identifiers message, length delimited. Does not implicitly {@link synthpop.Identifiers.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Identifiers
         * @static
         * @param {synthpop.IIdentifiers} message Identifiers message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Identifiers.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Identifiers message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Identifiers
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Identifiers} Identifiers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Identifiers.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Identifiers();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.origPid = reader.string();
                        break;
                    }
                case 2: {
                        message.idTusHh = reader.int64();
                        break;
                    }
                case 3: {
                        message.idTusP = reader.int64();
                        break;
                    }
                case 4: {
                        message.pidHs = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("origPid"))
                throw $util.ProtocolError("missing required 'origPid'", { instance: message });
            if (!message.hasOwnProperty("idTusHh"))
                throw $util.ProtocolError("missing required 'idTusHh'", { instance: message });
            if (!message.hasOwnProperty("idTusP"))
                throw $util.ProtocolError("missing required 'idTusP'", { instance: message });
            if (!message.hasOwnProperty("pidHs"))
                throw $util.ProtocolError("missing required 'pidHs'", { instance: message });
            return message;
        };

        /**
         * Decodes an Identifiers message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Identifiers
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Identifiers} Identifiers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Identifiers.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Identifiers message.
         * @function verify
         * @memberof synthpop.Identifiers
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Identifiers.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.origPid))
                return "origPid: string expected";
            if (!$util.isInteger(message.idTusHh) && !(message.idTusHh && $util.isInteger(message.idTusHh.low) && $util.isInteger(message.idTusHh.high)))
                return "idTusHh: integer|Long expected";
            if (!$util.isInteger(message.idTusP) && !(message.idTusP && $util.isInteger(message.idTusP.low) && $util.isInteger(message.idTusP.high)))
                return "idTusP: integer|Long expected";
            if (!$util.isInteger(message.pidHs) && !(message.pidHs && $util.isInteger(message.pidHs.low) && $util.isInteger(message.pidHs.high)))
                return "pidHs: integer|Long expected";
            return null;
        };

        /**
         * Creates an Identifiers message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Identifiers
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Identifiers} Identifiers
         */
        Identifiers.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Identifiers)
                return object;
            let message = new $root.synthpop.Identifiers();
            if (object.origPid != null)
                message.origPid = String(object.origPid);
            if (object.idTusHh != null)
                if ($util.Long)
                    (message.idTusHh = $util.Long.fromValue(object.idTusHh)).unsigned = false;
                else if (typeof object.idTusHh === "string")
                    message.idTusHh = parseInt(object.idTusHh, 10);
                else if (typeof object.idTusHh === "number")
                    message.idTusHh = object.idTusHh;
                else if (typeof object.idTusHh === "object")
                    message.idTusHh = new $util.LongBits(object.idTusHh.low >>> 0, object.idTusHh.high >>> 0).toNumber();
            if (object.idTusP != null)
                if ($util.Long)
                    (message.idTusP = $util.Long.fromValue(object.idTusP)).unsigned = false;
                else if (typeof object.idTusP === "string")
                    message.idTusP = parseInt(object.idTusP, 10);
                else if (typeof object.idTusP === "number")
                    message.idTusP = object.idTusP;
                else if (typeof object.idTusP === "object")
                    message.idTusP = new $util.LongBits(object.idTusP.low >>> 0, object.idTusP.high >>> 0).toNumber();
            if (object.pidHs != null)
                if ($util.Long)
                    (message.pidHs = $util.Long.fromValue(object.pidHs)).unsigned = false;
                else if (typeof object.pidHs === "string")
                    message.pidHs = parseInt(object.pidHs, 10);
                else if (typeof object.pidHs === "number")
                    message.pidHs = object.pidHs;
                else if (typeof object.pidHs === "object")
                    message.pidHs = new $util.LongBits(object.pidHs.low >>> 0, object.pidHs.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an Identifiers message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Identifiers
         * @static
         * @param {synthpop.Identifiers} message Identifiers
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Identifiers.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.origPid = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.idTusHh = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.idTusHh = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.idTusP = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.idTusP = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.pidHs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.pidHs = options.longs === String ? "0" : 0;
            }
            if (message.origPid != null && message.hasOwnProperty("origPid"))
                object.origPid = message.origPid;
            if (message.idTusHh != null && message.hasOwnProperty("idTusHh"))
                if (typeof message.idTusHh === "number")
                    object.idTusHh = options.longs === String ? String(message.idTusHh) : message.idTusHh;
                else
                    object.idTusHh = options.longs === String ? $util.Long.prototype.toString.call(message.idTusHh) : options.longs === Number ? new $util.LongBits(message.idTusHh.low >>> 0, message.idTusHh.high >>> 0).toNumber() : message.idTusHh;
            if (message.idTusP != null && message.hasOwnProperty("idTusP"))
                if (typeof message.idTusP === "number")
                    object.idTusP = options.longs === String ? String(message.idTusP) : message.idTusP;
                else
                    object.idTusP = options.longs === String ? $util.Long.prototype.toString.call(message.idTusP) : options.longs === Number ? new $util.LongBits(message.idTusP.low >>> 0, message.idTusP.high >>> 0).toNumber() : message.idTusP;
            if (message.pidHs != null && message.hasOwnProperty("pidHs"))
                if (typeof message.pidHs === "number")
                    object.pidHs = options.longs === String ? String(message.pidHs) : message.pidHs;
                else
                    object.pidHs = options.longs === String ? $util.Long.prototype.toString.call(message.pidHs) : options.longs === Number ? new $util.LongBits(message.pidHs.low >>> 0, message.pidHs.high >>> 0).toNumber() : message.pidHs;
            return object;
        };

        /**
         * Converts this Identifiers to JSON.
         * @function toJSON
         * @memberof synthpop.Identifiers
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Identifiers.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Identifiers
         * @function getTypeUrl
         * @memberof synthpop.Identifiers
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Identifiers.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Identifiers";
        };

        return Identifiers;
    })();

    synthpop.Demographics = (function() {

        /**
         * Properties of a Demographics.
         * @memberof synthpop
         * @interface IDemographics
         * @property {synthpop.Sex} sex Demographics sex
         * @property {number} ageYears Demographics ageYears
         * @property {synthpop.Ethnicity} ethnicity Demographics ethnicity
         * @property {synthpop.Nssec8|null} [nssec8] Demographics nssec8
         */

        /**
         * Constructs a new Demographics.
         * @memberof synthpop
         * @classdesc Represents a Demographics.
         * @implements IDemographics
         * @constructor
         * @param {synthpop.IDemographics=} [properties] Properties to set
         */
        function Demographics(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Demographics sex.
         * @member {synthpop.Sex} sex
         * @memberof synthpop.Demographics
         * @instance
         */
        Demographics.prototype.sex = 1;

        /**
         * Demographics ageYears.
         * @member {number} ageYears
         * @memberof synthpop.Demographics
         * @instance
         */
        Demographics.prototype.ageYears = 0;

        /**
         * Demographics ethnicity.
         * @member {synthpop.Ethnicity} ethnicity
         * @memberof synthpop.Demographics
         * @instance
         */
        Demographics.prototype.ethnicity = 1;

        /**
         * Demographics nssec8.
         * @member {synthpop.Nssec8} nssec8
         * @memberof synthpop.Demographics
         * @instance
         */
        Demographics.prototype.nssec8 = 1;

        /**
         * Creates a new Demographics instance using the specified properties.
         * @function create
         * @memberof synthpop.Demographics
         * @static
         * @param {synthpop.IDemographics=} [properties] Properties to set
         * @returns {synthpop.Demographics} Demographics instance
         */
        Demographics.create = function create(properties) {
            return new Demographics(properties);
        };

        /**
         * Encodes the specified Demographics message. Does not implicitly {@link synthpop.Demographics.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Demographics
         * @static
         * @param {synthpop.IDemographics} message Demographics message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Demographics.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.sex);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.ageYears);
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.ethnicity);
            if (message.nssec8 != null && Object.hasOwnProperty.call(message, "nssec8"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.nssec8);
            return writer;
        };

        /**
         * Encodes the specified Demographics message, length delimited. Does not implicitly {@link synthpop.Demographics.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Demographics
         * @static
         * @param {synthpop.IDemographics} message Demographics message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Demographics.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Demographics message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Demographics
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Demographics} Demographics
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Demographics.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Demographics();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.sex = reader.int32();
                        break;
                    }
                case 2: {
                        message.ageYears = reader.uint32();
                        break;
                    }
                case 3: {
                        message.ethnicity = reader.int32();
                        break;
                    }
                case 4: {
                        message.nssec8 = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("sex"))
                throw $util.ProtocolError("missing required 'sex'", { instance: message });
            if (!message.hasOwnProperty("ageYears"))
                throw $util.ProtocolError("missing required 'ageYears'", { instance: message });
            if (!message.hasOwnProperty("ethnicity"))
                throw $util.ProtocolError("missing required 'ethnicity'", { instance: message });
            return message;
        };

        /**
         * Decodes a Demographics message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Demographics
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Demographics} Demographics
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Demographics.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Demographics message.
         * @function verify
         * @memberof synthpop.Demographics
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Demographics.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            switch (message.sex) {
            default:
                return "sex: enum value expected";
            case 1:
            case 2:
                break;
            }
            if (!$util.isInteger(message.ageYears))
                return "ageYears: integer expected";
            switch (message.ethnicity) {
            default:
                return "ethnicity: enum value expected";
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            }
            if (message.nssec8 != null && message.hasOwnProperty("nssec8"))
                switch (message.nssec8) {
                default:
                    return "nssec8: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            return null;
        };

        /**
         * Creates a Demographics message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Demographics
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Demographics} Demographics
         */
        Demographics.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Demographics)
                return object;
            let message = new $root.synthpop.Demographics();
            switch (object.sex) {
            default:
                if (typeof object.sex === "number") {
                    message.sex = object.sex;
                    break;
                }
                break;
            case "MALE":
            case 1:
                message.sex = 1;
                break;
            case "FEMALE":
            case 2:
                message.sex = 2;
                break;
            }
            if (object.ageYears != null)
                message.ageYears = object.ageYears >>> 0;
            switch (object.ethnicity) {
            default:
                if (typeof object.ethnicity === "number") {
                    message.ethnicity = object.ethnicity;
                    break;
                }
                break;
            case "WHITE":
            case 1:
                message.ethnicity = 1;
                break;
            case "BLACK":
            case 2:
                message.ethnicity = 2;
                break;
            case "ASIAN":
            case 3:
                message.ethnicity = 3;
                break;
            case "MIXED":
            case 4:
                message.ethnicity = 4;
                break;
            case "OTHER":
            case 5:
                message.ethnicity = 5;
                break;
            }
            switch (object.nssec8) {
            default:
                if (typeof object.nssec8 === "number") {
                    message.nssec8 = object.nssec8;
                    break;
                }
                break;
            case "HIGHER":
            case 1:
                message.nssec8 = 1;
                break;
            case "LOWER":
            case 2:
                message.nssec8 = 2;
                break;
            case "INTERMEDIATE":
            case 3:
                message.nssec8 = 3;
                break;
            case "SMALL":
            case 4:
                message.nssec8 = 4;
                break;
            case "SUPER":
            case 5:
                message.nssec8 = 5;
                break;
            case "SEMIROUTINE":
            case 6:
                message.nssec8 = 6;
                break;
            case "ROUTINE":
            case 7:
                message.nssec8 = 7;
                break;
            case "NEVER":
            case 8:
                message.nssec8 = 8;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a Demographics message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Demographics
         * @static
         * @param {synthpop.Demographics} message Demographics
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Demographics.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.sex = options.enums === String ? "MALE" : 1;
                object.ageYears = 0;
                object.ethnicity = options.enums === String ? "WHITE" : 1;
                object.nssec8 = options.enums === String ? "HIGHER" : 1;
            }
            if (message.sex != null && message.hasOwnProperty("sex"))
                object.sex = options.enums === String ? $root.synthpop.Sex[message.sex] === undefined ? message.sex : $root.synthpop.Sex[message.sex] : message.sex;
            if (message.ageYears != null && message.hasOwnProperty("ageYears"))
                object.ageYears = message.ageYears;
            if (message.ethnicity != null && message.hasOwnProperty("ethnicity"))
                object.ethnicity = options.enums === String ? $root.synthpop.Ethnicity[message.ethnicity] === undefined ? message.ethnicity : $root.synthpop.Ethnicity[message.ethnicity] : message.ethnicity;
            if (message.nssec8 != null && message.hasOwnProperty("nssec8"))
                object.nssec8 = options.enums === String ? $root.synthpop.Nssec8[message.nssec8] === undefined ? message.nssec8 : $root.synthpop.Nssec8[message.nssec8] : message.nssec8;
            return object;
        };

        /**
         * Converts this Demographics to JSON.
         * @function toJSON
         * @memberof synthpop.Demographics
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Demographics.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Demographics
         * @function getTypeUrl
         * @memberof synthpop.Demographics
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Demographics.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Demographics";
        };

        return Demographics;
    })();

    synthpop.Employment = (function() {

        /**
         * Properties of an Employment.
         * @memberof synthpop
         * @interface IEmployment
         * @property {string|null} [sic1d2007] Employment sic1d2007
         * @property {number|Long|null} [sic2d2007] Employment sic2d2007
         * @property {number|Long|null} [soc2010] Employment soc2010
         * @property {synthpop.PwkStat} pwkstat Employment pwkstat
         * @property {number|null} [salaryYearly] Employment salaryYearly
         * @property {number|null} [salaryHourly] Employment salaryHourly
         */

        /**
         * Constructs a new Employment.
         * @memberof synthpop
         * @classdesc Represents an Employment.
         * @implements IEmployment
         * @constructor
         * @param {synthpop.IEmployment=} [properties] Properties to set
         */
        function Employment(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Employment sic1d2007.
         * @member {string} sic1d2007
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.sic1d2007 = "";

        /**
         * Employment sic2d2007.
         * @member {number|Long} sic2d2007
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.sic2d2007 = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Employment soc2010.
         * @member {number|Long} soc2010
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.soc2010 = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Employment pwkstat.
         * @member {synthpop.PwkStat} pwkstat
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.pwkstat = 0;

        /**
         * Employment salaryYearly.
         * @member {number} salaryYearly
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.salaryYearly = 0;

        /**
         * Employment salaryHourly.
         * @member {number} salaryHourly
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.salaryHourly = 0;

        /**
         * Creates a new Employment instance using the specified properties.
         * @function create
         * @memberof synthpop.Employment
         * @static
         * @param {synthpop.IEmployment=} [properties] Properties to set
         * @returns {synthpop.Employment} Employment instance
         */
        Employment.create = function create(properties) {
            return new Employment(properties);
        };

        /**
         * Encodes the specified Employment message. Does not implicitly {@link synthpop.Employment.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Employment
         * @static
         * @param {synthpop.IEmployment} message Employment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Employment.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sic1d2007 != null && Object.hasOwnProperty.call(message, "sic1d2007"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.sic1d2007);
            if (message.sic2d2007 != null && Object.hasOwnProperty.call(message, "sic2d2007"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.sic2d2007);
            if (message.soc2010 != null && Object.hasOwnProperty.call(message, "soc2010"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.soc2010);
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.pwkstat);
            if (message.salaryYearly != null && Object.hasOwnProperty.call(message, "salaryYearly"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.salaryYearly);
            if (message.salaryHourly != null && Object.hasOwnProperty.call(message, "salaryHourly"))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.salaryHourly);
            return writer;
        };

        /**
         * Encodes the specified Employment message, length delimited. Does not implicitly {@link synthpop.Employment.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Employment
         * @static
         * @param {synthpop.IEmployment} message Employment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Employment.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Employment message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Employment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Employment} Employment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Employment.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Employment();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.sic1d2007 = reader.string();
                        break;
                    }
                case 2: {
                        message.sic2d2007 = reader.uint64();
                        break;
                    }
                case 3: {
                        message.soc2010 = reader.uint64();
                        break;
                    }
                case 4: {
                        message.pwkstat = reader.int32();
                        break;
                    }
                case 5: {
                        message.salaryYearly = reader.float();
                        break;
                    }
                case 6: {
                        message.salaryHourly = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("pwkstat"))
                throw $util.ProtocolError("missing required 'pwkstat'", { instance: message });
            return message;
        };

        /**
         * Decodes an Employment message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Employment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Employment} Employment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Employment.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Employment message.
         * @function verify
         * @memberof synthpop.Employment
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Employment.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sic1d2007 != null && message.hasOwnProperty("sic1d2007"))
                if (!$util.isString(message.sic1d2007))
                    return "sic1d2007: string expected";
            if (message.sic2d2007 != null && message.hasOwnProperty("sic2d2007"))
                if (!$util.isInteger(message.sic2d2007) && !(message.sic2d2007 && $util.isInteger(message.sic2d2007.low) && $util.isInteger(message.sic2d2007.high)))
                    return "sic2d2007: integer|Long expected";
            if (message.soc2010 != null && message.hasOwnProperty("soc2010"))
                if (!$util.isInteger(message.soc2010) && !(message.soc2010 && $util.isInteger(message.soc2010.low) && $util.isInteger(message.soc2010.high)))
                    return "soc2010: integer|Long expected";
            switch (message.pwkstat) {
            default:
                return "pwkstat: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                break;
            }
            if (message.salaryYearly != null && message.hasOwnProperty("salaryYearly"))
                if (typeof message.salaryYearly !== "number")
                    return "salaryYearly: number expected";
            if (message.salaryHourly != null && message.hasOwnProperty("salaryHourly"))
                if (typeof message.salaryHourly !== "number")
                    return "salaryHourly: number expected";
            return null;
        };

        /**
         * Creates an Employment message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Employment
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Employment} Employment
         */
        Employment.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Employment)
                return object;
            let message = new $root.synthpop.Employment();
            if (object.sic1d2007 != null)
                message.sic1d2007 = String(object.sic1d2007);
            if (object.sic2d2007 != null)
                if ($util.Long)
                    (message.sic2d2007 = $util.Long.fromValue(object.sic2d2007)).unsigned = true;
                else if (typeof object.sic2d2007 === "string")
                    message.sic2d2007 = parseInt(object.sic2d2007, 10);
                else if (typeof object.sic2d2007 === "number")
                    message.sic2d2007 = object.sic2d2007;
                else if (typeof object.sic2d2007 === "object")
                    message.sic2d2007 = new $util.LongBits(object.sic2d2007.low >>> 0, object.sic2d2007.high >>> 0).toNumber(true);
            if (object.soc2010 != null)
                if ($util.Long)
                    (message.soc2010 = $util.Long.fromValue(object.soc2010)).unsigned = true;
                else if (typeof object.soc2010 === "string")
                    message.soc2010 = parseInt(object.soc2010, 10);
                else if (typeof object.soc2010 === "number")
                    message.soc2010 = object.soc2010;
                else if (typeof object.soc2010 === "object")
                    message.soc2010 = new $util.LongBits(object.soc2010.low >>> 0, object.soc2010.high >>> 0).toNumber(true);
            switch (object.pwkstat) {
            default:
                if (typeof object.pwkstat === "number") {
                    message.pwkstat = object.pwkstat;
                    break;
                }
                break;
            case "NA":
            case 0:
                message.pwkstat = 0;
                break;
            case "EMPLOYEE_FT":
            case 1:
                message.pwkstat = 1;
                break;
            case "EMPLOYEE_PT":
            case 2:
                message.pwkstat = 2;
                break;
            case "EMPLOYEE_UNSPEC":
            case 3:
                message.pwkstat = 3;
                break;
            case "SELF_EMPLOYED":
            case 4:
                message.pwkstat = 4;
                break;
            case "PWK_UNEMPLOYED":
            case 5:
                message.pwkstat = 5;
                break;
            case "RETIRED":
            case 6:
                message.pwkstat = 6;
                break;
            case "HOMEMAKER":
            case 7:
                message.pwkstat = 7;
                break;
            case "STUDENT_FT":
            case 8:
                message.pwkstat = 8;
                break;
            case "LONG_TERM_SICK":
            case 9:
                message.pwkstat = 9;
                break;
            case "PWK_OTHER":
            case 10:
                message.pwkstat = 10;
                break;
            }
            if (object.salaryYearly != null)
                message.salaryYearly = Number(object.salaryYearly);
            if (object.salaryHourly != null)
                message.salaryHourly = Number(object.salaryHourly);
            return message;
        };

        /**
         * Creates a plain object from an Employment message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Employment
         * @static
         * @param {synthpop.Employment} message Employment
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Employment.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.sic1d2007 = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.sic2d2007 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sic2d2007 = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.soc2010 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.soc2010 = options.longs === String ? "0" : 0;
                object.pwkstat = options.enums === String ? "NA" : 0;
                object.salaryYearly = 0;
                object.salaryHourly = 0;
            }
            if (message.sic1d2007 != null && message.hasOwnProperty("sic1d2007"))
                object.sic1d2007 = message.sic1d2007;
            if (message.sic2d2007 != null && message.hasOwnProperty("sic2d2007"))
                if (typeof message.sic2d2007 === "number")
                    object.sic2d2007 = options.longs === String ? String(message.sic2d2007) : message.sic2d2007;
                else
                    object.sic2d2007 = options.longs === String ? $util.Long.prototype.toString.call(message.sic2d2007) : options.longs === Number ? new $util.LongBits(message.sic2d2007.low >>> 0, message.sic2d2007.high >>> 0).toNumber(true) : message.sic2d2007;
            if (message.soc2010 != null && message.hasOwnProperty("soc2010"))
                if (typeof message.soc2010 === "number")
                    object.soc2010 = options.longs === String ? String(message.soc2010) : message.soc2010;
                else
                    object.soc2010 = options.longs === String ? $util.Long.prototype.toString.call(message.soc2010) : options.longs === Number ? new $util.LongBits(message.soc2010.low >>> 0, message.soc2010.high >>> 0).toNumber(true) : message.soc2010;
            if (message.pwkstat != null && message.hasOwnProperty("pwkstat"))
                object.pwkstat = options.enums === String ? $root.synthpop.PwkStat[message.pwkstat] === undefined ? message.pwkstat : $root.synthpop.PwkStat[message.pwkstat] : message.pwkstat;
            if (message.salaryYearly != null && message.hasOwnProperty("salaryYearly"))
                object.salaryYearly = options.json && !isFinite(message.salaryYearly) ? String(message.salaryYearly) : message.salaryYearly;
            if (message.salaryHourly != null && message.hasOwnProperty("salaryHourly"))
                object.salaryHourly = options.json && !isFinite(message.salaryHourly) ? String(message.salaryHourly) : message.salaryHourly;
            return object;
        };

        /**
         * Converts this Employment to JSON.
         * @function toJSON
         * @memberof synthpop.Employment
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Employment.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Employment
         * @function getTypeUrl
         * @memberof synthpop.Employment
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Employment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Employment";
        };

        return Employment;
    })();

    /**
     * Sex enum.
     * @name synthpop.Sex
     * @enum {number}
     * @property {number} MALE=1 MALE value
     * @property {number} FEMALE=2 FEMALE value
     */
    synthpop.Sex = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "MALE"] = 1;
        values[valuesById[2] = "FEMALE"] = 2;
        return values;
    })();

    /**
     * Ethnicity enum.
     * @name synthpop.Ethnicity
     * @enum {number}
     * @property {number} WHITE=1 WHITE value
     * @property {number} BLACK=2 BLACK value
     * @property {number} ASIAN=3 ASIAN value
     * @property {number} MIXED=4 MIXED value
     * @property {number} OTHER=5 OTHER value
     */
    synthpop.Ethnicity = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "WHITE"] = 1;
        values[valuesById[2] = "BLACK"] = 2;
        values[valuesById[3] = "ASIAN"] = 3;
        values[valuesById[4] = "MIXED"] = 4;
        values[valuesById[5] = "OTHER"] = 5;
        return values;
    })();

    /**
     * AccommodationType enum.
     * @name synthpop.AccommodationType
     * @enum {number}
     * @property {number} DETACHED=1 DETACHED value
     * @property {number} SEMI_DETACHED=2 SEMI_DETACHED value
     * @property {number} TERRACED=3 TERRACED value
     * @property {number} FLAT=4 FLAT value
     */
    synthpop.AccommodationType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "DETACHED"] = 1;
        values[valuesById[2] = "SEMI_DETACHED"] = 2;
        values[valuesById[3] = "TERRACED"] = 3;
        values[valuesById[4] = "FLAT"] = 4;
        return values;
    })();

    /**
     * CommunalType enum.
     * @name synthpop.CommunalType
     * @enum {number}
     * @property {number} COMMUNAL=0 COMMUNAL value
     * @property {number} MEDICAL=1 MEDICAL value
     * @property {number} MEDICAL_NHS=2 MEDICAL_NHS value
     * @property {number} MEDICAL_NHS_HOSPITAL=3 MEDICAL_NHS_HOSPITAL value
     * @property {number} MEDICAL_NHS_MENTAL=4 MEDICAL_NHS_MENTAL value
     * @property {number} MEDICAL_NHS_OTHER=5 MEDICAL_NHS_OTHER value
     * @property {number} MEDICAL_LA=6 MEDICAL_LA value
     * @property {number} MEDICAL_LA_CHILDREN=7 MEDICAL_LA_CHILDREN value
     * @property {number} MEDICAL_LA_CARE_HOME_NURSING=8 MEDICAL_LA_CARE_HOME_NURSING value
     * @property {number} MEDICAL_LA_CARE_HOME_NO_NURSING=9 MEDICAL_LA_CARE_HOME_NO_NURSING value
     * @property {number} MEDICAL_LA_OTHER=10 MEDICAL_LA_OTHER value
     * @property {number} MEDICAL_SOCIAL=11 MEDICAL_SOCIAL value
     * @property {number} MEDICAL_SOCIAL_HOSTEL=12 MEDICAL_SOCIAL_HOSTEL value
     * @property {number} MEDICAL_SOCIAL_SHELTER=13 MEDICAL_SOCIAL_SHELTER value
     * @property {number} MEDICAL_OTHER=14 MEDICAL_OTHER value
     * @property {number} MEDICAL_OTHER_CARE_HOME_NURSING=15 MEDICAL_OTHER_CARE_HOME_NURSING value
     * @property {number} MEDICAL_OTHER_CARE_HOME_NO_NURSING=16 MEDICAL_OTHER_CARE_HOME_NO_NURSING value
     * @property {number} MEDICAL_OTHER_CHILDREN=17 MEDICAL_OTHER_CHILDREN value
     * @property {number} MEDICAL_OTHER_MENTAL=18 MEDICAL_OTHER_MENTAL value
     * @property {number} MEDICAL_OTHER_HOSPITAL=19 MEDICAL_OTHER_HOSPITAL value
     * @property {number} MEDICAL_OTHER_OTHER=20 MEDICAL_OTHER_OTHER value
     * @property {number} COM_OTHER=21 COM_OTHER value
     * @property {number} DEFENSE=22 DEFENSE value
     * @property {number} PRISON=23 PRISON value
     * @property {number} PROBATION=24 PROBATION value
     * @property {number} DETENTION=25 DETENTION value
     * @property {number} EDUCATION=26 EDUCATION value
     * @property {number} HOTEL=27 HOTEL value
     * @property {number} HOSTEL=28 HOSTEL value
     * @property {number} HOLIDAY=29 HOLIDAY value
     * @property {number} TRAVEL=30 TRAVEL value
     * @property {number} RELIGIOUS=31 RELIGIOUS value
     * @property {number} STAFF=32 STAFF value
     * @property {number} OTHER_OTHER=33 OTHER_OTHER value
     * @property {number} NOT_STATED=34 NOT_STATED value
     */
    synthpop.CommunalType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "COMMUNAL"] = 0;
        values[valuesById[1] = "MEDICAL"] = 1;
        values[valuesById[2] = "MEDICAL_NHS"] = 2;
        values[valuesById[3] = "MEDICAL_NHS_HOSPITAL"] = 3;
        values[valuesById[4] = "MEDICAL_NHS_MENTAL"] = 4;
        values[valuesById[5] = "MEDICAL_NHS_OTHER"] = 5;
        values[valuesById[6] = "MEDICAL_LA"] = 6;
        values[valuesById[7] = "MEDICAL_LA_CHILDREN"] = 7;
        values[valuesById[8] = "MEDICAL_LA_CARE_HOME_NURSING"] = 8;
        values[valuesById[9] = "MEDICAL_LA_CARE_HOME_NO_NURSING"] = 9;
        values[valuesById[10] = "MEDICAL_LA_OTHER"] = 10;
        values[valuesById[11] = "MEDICAL_SOCIAL"] = 11;
        values[valuesById[12] = "MEDICAL_SOCIAL_HOSTEL"] = 12;
        values[valuesById[13] = "MEDICAL_SOCIAL_SHELTER"] = 13;
        values[valuesById[14] = "MEDICAL_OTHER"] = 14;
        values[valuesById[15] = "MEDICAL_OTHER_CARE_HOME_NURSING"] = 15;
        values[valuesById[16] = "MEDICAL_OTHER_CARE_HOME_NO_NURSING"] = 16;
        values[valuesById[17] = "MEDICAL_OTHER_CHILDREN"] = 17;
        values[valuesById[18] = "MEDICAL_OTHER_MENTAL"] = 18;
        values[valuesById[19] = "MEDICAL_OTHER_HOSPITAL"] = 19;
        values[valuesById[20] = "MEDICAL_OTHER_OTHER"] = 20;
        values[valuesById[21] = "COM_OTHER"] = 21;
        values[valuesById[22] = "DEFENSE"] = 22;
        values[valuesById[23] = "PRISON"] = 23;
        values[valuesById[24] = "PROBATION"] = 24;
        values[valuesById[25] = "DETENTION"] = 25;
        values[valuesById[26] = "EDUCATION"] = 26;
        values[valuesById[27] = "HOTEL"] = 27;
        values[valuesById[28] = "HOSTEL"] = 28;
        values[valuesById[29] = "HOLIDAY"] = 29;
        values[valuesById[30] = "TRAVEL"] = 30;
        values[valuesById[31] = "RELIGIOUS"] = 31;
        values[valuesById[32] = "STAFF"] = 32;
        values[valuesById[33] = "OTHER_OTHER"] = 33;
        values[valuesById[34] = "NOT_STATED"] = 34;
        return values;
    })();

    /**
     * Tenure enum.
     * @name synthpop.Tenure
     * @enum {number}
     * @property {number} OWNED_FULLY=1 OWNED_FULLY value
     * @property {number} OWNED_MORTGAGE=2 OWNED_MORTGAGE value
     * @property {number} RENTED_FREE=3 RENTED_FREE value
     * @property {number} RENTED_SOCIAL=4 RENTED_SOCIAL value
     * @property {number} RENTED_PRIVATE=5 RENTED_PRIVATE value
     */
    synthpop.Tenure = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "OWNED_FULLY"] = 1;
        values[valuesById[2] = "OWNED_MORTGAGE"] = 2;
        values[valuesById[3] = "RENTED_FREE"] = 3;
        values[valuesById[4] = "RENTED_SOCIAL"] = 4;
        values[valuesById[5] = "RENTED_PRIVATE"] = 5;
        return values;
    })();

    /**
     * Nssec8 enum.
     * @name synthpop.Nssec8
     * @enum {number}
     * @property {number} HIGHER=1 HIGHER value
     * @property {number} LOWER=2 LOWER value
     * @property {number} INTERMEDIATE=3 INTERMEDIATE value
     * @property {number} SMALL=4 SMALL value
     * @property {number} SUPER=5 SUPER value
     * @property {number} SEMIROUTINE=6 SEMIROUTINE value
     * @property {number} ROUTINE=7 ROUTINE value
     * @property {number} NEVER=8 NEVER value
     */
    synthpop.Nssec8 = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "HIGHER"] = 1;
        values[valuesById[2] = "LOWER"] = 2;
        values[valuesById[3] = "INTERMEDIATE"] = 3;
        values[valuesById[4] = "SMALL"] = 4;
        values[valuesById[5] = "SUPER"] = 5;
        values[valuesById[6] = "SEMIROUTINE"] = 6;
        values[valuesById[7] = "ROUTINE"] = 7;
        values[valuesById[8] = "NEVER"] = 8;
        return values;
    })();

    /**
     * PwkStat enum.
     * @name synthpop.PwkStat
     * @enum {number}
     * @property {number} NA=0 NA value
     * @property {number} EMPLOYEE_FT=1 EMPLOYEE_FT value
     * @property {number} EMPLOYEE_PT=2 EMPLOYEE_PT value
     * @property {number} EMPLOYEE_UNSPEC=3 EMPLOYEE_UNSPEC value
     * @property {number} SELF_EMPLOYED=4 SELF_EMPLOYED value
     * @property {number} PWK_UNEMPLOYED=5 PWK_UNEMPLOYED value
     * @property {number} RETIRED=6 RETIRED value
     * @property {number} HOMEMAKER=7 HOMEMAKER value
     * @property {number} STUDENT_FT=8 STUDENT_FT value
     * @property {number} LONG_TERM_SICK=9 LONG_TERM_SICK value
     * @property {number} PWK_OTHER=10 PWK_OTHER value
     */
    synthpop.PwkStat = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "NA"] = 0;
        values[valuesById[1] = "EMPLOYEE_FT"] = 1;
        values[valuesById[2] = "EMPLOYEE_PT"] = 2;
        values[valuesById[3] = "EMPLOYEE_UNSPEC"] = 3;
        values[valuesById[4] = "SELF_EMPLOYED"] = 4;
        values[valuesById[5] = "PWK_UNEMPLOYED"] = 5;
        values[valuesById[6] = "RETIRED"] = 6;
        values[valuesById[7] = "HOMEMAKER"] = 7;
        values[valuesById[8] = "STUDENT_FT"] = 8;
        values[valuesById[9] = "LONG_TERM_SICK"] = 9;
        values[valuesById[10] = "PWK_OTHER"] = 10;
        return values;
    })();

    synthpop.Health = (function() {

        /**
         * Properties of a Health.
         * @memberof synthpop
         * @interface IHealth
         * @property {number|null} [bmi] Health bmi
         * @property {boolean} hasCardiovascularDisease Health hasCardiovascularDisease
         * @property {boolean} hasDiabetes Health hasDiabetes
         * @property {boolean} hasHighBloodPressure Health hasHighBloodPressure
         * @property {number|Long|null} [numberMedications] Health numberMedications
         * @property {synthpop.SelfAssessedHealth|null} [selfAssessedHealth] Health selfAssessedHealth
         * @property {synthpop.LifeSatisfaction|null} [lifeSatisfaction] Health lifeSatisfaction
         */

        /**
         * Constructs a new Health.
         * @memberof synthpop
         * @classdesc Represents a Health.
         * @implements IHealth
         * @constructor
         * @param {synthpop.IHealth=} [properties] Properties to set
         */
        function Health(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Health bmi.
         * @member {number} bmi
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.bmi = 0;

        /**
         * Health hasCardiovascularDisease.
         * @member {boolean} hasCardiovascularDisease
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.hasCardiovascularDisease = false;

        /**
         * Health hasDiabetes.
         * @member {boolean} hasDiabetes
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.hasDiabetes = false;

        /**
         * Health hasHighBloodPressure.
         * @member {boolean} hasHighBloodPressure
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.hasHighBloodPressure = false;

        /**
         * Health numberMedications.
         * @member {number|Long} numberMedications
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.numberMedications = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Health selfAssessedHealth.
         * @member {synthpop.SelfAssessedHealth} selfAssessedHealth
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.selfAssessedHealth = 1;

        /**
         * Health lifeSatisfaction.
         * @member {synthpop.LifeSatisfaction} lifeSatisfaction
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.lifeSatisfaction = 1;

        /**
         * Creates a new Health instance using the specified properties.
         * @function create
         * @memberof synthpop.Health
         * @static
         * @param {synthpop.IHealth=} [properties] Properties to set
         * @returns {synthpop.Health} Health instance
         */
        Health.create = function create(properties) {
            return new Health(properties);
        };

        /**
         * Encodes the specified Health message. Does not implicitly {@link synthpop.Health.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Health
         * @static
         * @param {synthpop.IHealth} message Health message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Health.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.bmi != null && Object.hasOwnProperty.call(message, "bmi"))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.bmi);
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.hasCardiovascularDisease);
            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.hasDiabetes);
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.hasHighBloodPressure);
            if (message.numberMedications != null && Object.hasOwnProperty.call(message, "numberMedications"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.numberMedications);
            if (message.selfAssessedHealth != null && Object.hasOwnProperty.call(message, "selfAssessedHealth"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.selfAssessedHealth);
            if (message.lifeSatisfaction != null && Object.hasOwnProperty.call(message, "lifeSatisfaction"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.lifeSatisfaction);
            return writer;
        };

        /**
         * Encodes the specified Health message, length delimited. Does not implicitly {@link synthpop.Health.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Health
         * @static
         * @param {synthpop.IHealth} message Health message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Health.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Health message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Health
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Health} Health
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Health.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Health();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.bmi = reader.float();
                        break;
                    }
                case 2: {
                        message.hasCardiovascularDisease = reader.bool();
                        break;
                    }
                case 3: {
                        message.hasDiabetes = reader.bool();
                        break;
                    }
                case 4: {
                        message.hasHighBloodPressure = reader.bool();
                        break;
                    }
                case 5: {
                        message.numberMedications = reader.uint64();
                        break;
                    }
                case 6: {
                        message.selfAssessedHealth = reader.int32();
                        break;
                    }
                case 7: {
                        message.lifeSatisfaction = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("hasCardiovascularDisease"))
                throw $util.ProtocolError("missing required 'hasCardiovascularDisease'", { instance: message });
            if (!message.hasOwnProperty("hasDiabetes"))
                throw $util.ProtocolError("missing required 'hasDiabetes'", { instance: message });
            if (!message.hasOwnProperty("hasHighBloodPressure"))
                throw $util.ProtocolError("missing required 'hasHighBloodPressure'", { instance: message });
            return message;
        };

        /**
         * Decodes a Health message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Health
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Health} Health
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Health.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Health message.
         * @function verify
         * @memberof synthpop.Health
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Health.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.bmi != null && message.hasOwnProperty("bmi"))
                if (typeof message.bmi !== "number")
                    return "bmi: number expected";
            if (typeof message.hasCardiovascularDisease !== "boolean")
                return "hasCardiovascularDisease: boolean expected";
            if (typeof message.hasDiabetes !== "boolean")
                return "hasDiabetes: boolean expected";
            if (typeof message.hasHighBloodPressure !== "boolean")
                return "hasHighBloodPressure: boolean expected";
            if (message.numberMedications != null && message.hasOwnProperty("numberMedications"))
                if (!$util.isInteger(message.numberMedications) && !(message.numberMedications && $util.isInteger(message.numberMedications.low) && $util.isInteger(message.numberMedications.high)))
                    return "numberMedications: integer|Long expected";
            if (message.selfAssessedHealth != null && message.hasOwnProperty("selfAssessedHealth"))
                switch (message.selfAssessedHealth) {
                default:
                    return "selfAssessedHealth: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.lifeSatisfaction != null && message.hasOwnProperty("lifeSatisfaction"))
                switch (message.lifeSatisfaction) {
                default:
                    return "lifeSatisfaction: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            return null;
        };

        /**
         * Creates a Health message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Health
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Health} Health
         */
        Health.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Health)
                return object;
            let message = new $root.synthpop.Health();
            if (object.bmi != null)
                message.bmi = Number(object.bmi);
            if (object.hasCardiovascularDisease != null)
                message.hasCardiovascularDisease = Boolean(object.hasCardiovascularDisease);
            if (object.hasDiabetes != null)
                message.hasDiabetes = Boolean(object.hasDiabetes);
            if (object.hasHighBloodPressure != null)
                message.hasHighBloodPressure = Boolean(object.hasHighBloodPressure);
            if (object.numberMedications != null)
                if ($util.Long)
                    (message.numberMedications = $util.Long.fromValue(object.numberMedications)).unsigned = true;
                else if (typeof object.numberMedications === "string")
                    message.numberMedications = parseInt(object.numberMedications, 10);
                else if (typeof object.numberMedications === "number")
                    message.numberMedications = object.numberMedications;
                else if (typeof object.numberMedications === "object")
                    message.numberMedications = new $util.LongBits(object.numberMedications.low >>> 0, object.numberMedications.high >>> 0).toNumber(true);
            switch (object.selfAssessedHealth) {
            default:
                if (typeof object.selfAssessedHealth === "number") {
                    message.selfAssessedHealth = object.selfAssessedHealth;
                    break;
                }
                break;
            case "VERY_GOOD":
            case 1:
                message.selfAssessedHealth = 1;
                break;
            case "GOOD":
            case 2:
                message.selfAssessedHealth = 2;
                break;
            case "FAIR":
            case 3:
                message.selfAssessedHealth = 3;
                break;
            case "BAD":
            case 4:
                message.selfAssessedHealth = 4;
                break;
            case "VERY_BAD":
            case 5:
                message.selfAssessedHealth = 5;
                break;
            }
            switch (object.lifeSatisfaction) {
            default:
                if (typeof object.lifeSatisfaction === "number") {
                    message.lifeSatisfaction = object.lifeSatisfaction;
                    break;
                }
                break;
            case "LOW":
            case 1:
                message.lifeSatisfaction = 1;
                break;
            case "MEDIUM":
            case 2:
                message.lifeSatisfaction = 2;
                break;
            case "HIGH":
            case 3:
                message.lifeSatisfaction = 3;
                break;
            case "VERY_HIGH":
            case 4:
                message.lifeSatisfaction = 4;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a Health message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Health
         * @static
         * @param {synthpop.Health} message Health
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Health.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.bmi = 0;
                object.hasCardiovascularDisease = false;
                object.hasDiabetes = false;
                object.hasHighBloodPressure = false;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.numberMedications = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.numberMedications = options.longs === String ? "0" : 0;
                object.selfAssessedHealth = options.enums === String ? "VERY_GOOD" : 1;
                object.lifeSatisfaction = options.enums === String ? "LOW" : 1;
            }
            if (message.bmi != null && message.hasOwnProperty("bmi"))
                object.bmi = options.json && !isFinite(message.bmi) ? String(message.bmi) : message.bmi;
            if (message.hasCardiovascularDisease != null && message.hasOwnProperty("hasCardiovascularDisease"))
                object.hasCardiovascularDisease = message.hasCardiovascularDisease;
            if (message.hasDiabetes != null && message.hasOwnProperty("hasDiabetes"))
                object.hasDiabetes = message.hasDiabetes;
            if (message.hasHighBloodPressure != null && message.hasOwnProperty("hasHighBloodPressure"))
                object.hasHighBloodPressure = message.hasHighBloodPressure;
            if (message.numberMedications != null && message.hasOwnProperty("numberMedications"))
                if (typeof message.numberMedications === "number")
                    object.numberMedications = options.longs === String ? String(message.numberMedications) : message.numberMedications;
                else
                    object.numberMedications = options.longs === String ? $util.Long.prototype.toString.call(message.numberMedications) : options.longs === Number ? new $util.LongBits(message.numberMedications.low >>> 0, message.numberMedications.high >>> 0).toNumber(true) : message.numberMedications;
            if (message.selfAssessedHealth != null && message.hasOwnProperty("selfAssessedHealth"))
                object.selfAssessedHealth = options.enums === String ? $root.synthpop.SelfAssessedHealth[message.selfAssessedHealth] === undefined ? message.selfAssessedHealth : $root.synthpop.SelfAssessedHealth[message.selfAssessedHealth] : message.selfAssessedHealth;
            if (message.lifeSatisfaction != null && message.hasOwnProperty("lifeSatisfaction"))
                object.lifeSatisfaction = options.enums === String ? $root.synthpop.LifeSatisfaction[message.lifeSatisfaction] === undefined ? message.lifeSatisfaction : $root.synthpop.LifeSatisfaction[message.lifeSatisfaction] : message.lifeSatisfaction;
            return object;
        };

        /**
         * Converts this Health to JSON.
         * @function toJSON
         * @memberof synthpop.Health
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Health.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Health
         * @function getTypeUrl
         * @memberof synthpop.Health
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Health.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Health";
        };

        return Health;
    })();

    /**
     * SelfAssessedHealth enum.
     * @name synthpop.SelfAssessedHealth
     * @enum {number}
     * @property {number} VERY_GOOD=1 VERY_GOOD value
     * @property {number} GOOD=2 GOOD value
     * @property {number} FAIR=3 FAIR value
     * @property {number} BAD=4 BAD value
     * @property {number} VERY_BAD=5 VERY_BAD value
     */
    synthpop.SelfAssessedHealth = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "VERY_GOOD"] = 1;
        values[valuesById[2] = "GOOD"] = 2;
        values[valuesById[3] = "FAIR"] = 3;
        values[valuesById[4] = "BAD"] = 4;
        values[valuesById[5] = "VERY_BAD"] = 5;
        return values;
    })();

    /**
     * LifeSatisfaction enum.
     * @name synthpop.LifeSatisfaction
     * @enum {number}
     * @property {number} LOW=1 LOW value
     * @property {number} MEDIUM=2 MEDIUM value
     * @property {number} HIGH=3 HIGH value
     * @property {number} VERY_HIGH=4 VERY_HIGH value
     */
    synthpop.LifeSatisfaction = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "LOW"] = 1;
        values[valuesById[2] = "MEDIUM"] = 2;
        values[valuesById[3] = "HIGH"] = 3;
        values[valuesById[4] = "VERY_HIGH"] = 4;
        return values;
    })();

    synthpop.Events = (function() {

        /**
         * Properties of an Events.
         * @memberof synthpop
         * @interface IEvents
         * @property {number} sport Events sport
         * @property {number} rugby Events rugby
         * @property {number} concertM Events concertM
         * @property {number} concertF Events concertF
         * @property {number} concertMs Events concertMs
         * @property {number} concertFs Events concertFs
         * @property {number} museum Events museum
         */

        /**
         * Constructs a new Events.
         * @memberof synthpop
         * @classdesc Represents an Events.
         * @implements IEvents
         * @constructor
         * @param {synthpop.IEvents=} [properties] Properties to set
         */
        function Events(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Events sport.
         * @member {number} sport
         * @memberof synthpop.Events
         * @instance
         */
        Events.prototype.sport = 0;

        /**
         * Events rugby.
         * @member {number} rugby
         * @memberof synthpop.Events
         * @instance
         */
        Events.prototype.rugby = 0;

        /**
         * Events concertM.
         * @member {number} concertM
         * @memberof synthpop.Events
         * @instance
         */
        Events.prototype.concertM = 0;

        /**
         * Events concertF.
         * @member {number} concertF
         * @memberof synthpop.Events
         * @instance
         */
        Events.prototype.concertF = 0;

        /**
         * Events concertMs.
         * @member {number} concertMs
         * @memberof synthpop.Events
         * @instance
         */
        Events.prototype.concertMs = 0;

        /**
         * Events concertFs.
         * @member {number} concertFs
         * @memberof synthpop.Events
         * @instance
         */
        Events.prototype.concertFs = 0;

        /**
         * Events museum.
         * @member {number} museum
         * @memberof synthpop.Events
         * @instance
         */
        Events.prototype.museum = 0;

        /**
         * Creates a new Events instance using the specified properties.
         * @function create
         * @memberof synthpop.Events
         * @static
         * @param {synthpop.IEvents=} [properties] Properties to set
         * @returns {synthpop.Events} Events instance
         */
        Events.create = function create(properties) {
            return new Events(properties);
        };

        /**
         * Encodes the specified Events message. Does not implicitly {@link synthpop.Events.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Events
         * @static
         * @param {synthpop.IEvents} message Events message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Events.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.sport);
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.rugby);
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.concertM);
            writer.uint32(/* id 4, wireType 5 =*/37).float(message.concertF);
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.concertMs);
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.concertFs);
            writer.uint32(/* id 7, wireType 5 =*/61).float(message.museum);
            return writer;
        };

        /**
         * Encodes the specified Events message, length delimited. Does not implicitly {@link synthpop.Events.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Events
         * @static
         * @param {synthpop.IEvents} message Events message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Events.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Events message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Events
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Events} Events
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Events.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Events();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.sport = reader.float();
                        break;
                    }
                case 2: {
                        message.rugby = reader.float();
                        break;
                    }
                case 3: {
                        message.concertM = reader.float();
                        break;
                    }
                case 4: {
                        message.concertF = reader.float();
                        break;
                    }
                case 5: {
                        message.concertMs = reader.float();
                        break;
                    }
                case 6: {
                        message.concertFs = reader.float();
                        break;
                    }
                case 7: {
                        message.museum = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("sport"))
                throw $util.ProtocolError("missing required 'sport'", { instance: message });
            if (!message.hasOwnProperty("rugby"))
                throw $util.ProtocolError("missing required 'rugby'", { instance: message });
            if (!message.hasOwnProperty("concertM"))
                throw $util.ProtocolError("missing required 'concertM'", { instance: message });
            if (!message.hasOwnProperty("concertF"))
                throw $util.ProtocolError("missing required 'concertF'", { instance: message });
            if (!message.hasOwnProperty("concertMs"))
                throw $util.ProtocolError("missing required 'concertMs'", { instance: message });
            if (!message.hasOwnProperty("concertFs"))
                throw $util.ProtocolError("missing required 'concertFs'", { instance: message });
            if (!message.hasOwnProperty("museum"))
                throw $util.ProtocolError("missing required 'museum'", { instance: message });
            return message;
        };

        /**
         * Decodes an Events message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Events
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Events} Events
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Events.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Events message.
         * @function verify
         * @memberof synthpop.Events
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Events.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (typeof message.sport !== "number")
                return "sport: number expected";
            if (typeof message.rugby !== "number")
                return "rugby: number expected";
            if (typeof message.concertM !== "number")
                return "concertM: number expected";
            if (typeof message.concertF !== "number")
                return "concertF: number expected";
            if (typeof message.concertMs !== "number")
                return "concertMs: number expected";
            if (typeof message.concertFs !== "number")
                return "concertFs: number expected";
            if (typeof message.museum !== "number")
                return "museum: number expected";
            return null;
        };

        /**
         * Creates an Events message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Events
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Events} Events
         */
        Events.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Events)
                return object;
            let message = new $root.synthpop.Events();
            if (object.sport != null)
                message.sport = Number(object.sport);
            if (object.rugby != null)
                message.rugby = Number(object.rugby);
            if (object.concertM != null)
                message.concertM = Number(object.concertM);
            if (object.concertF != null)
                message.concertF = Number(object.concertF);
            if (object.concertMs != null)
                message.concertMs = Number(object.concertMs);
            if (object.concertFs != null)
                message.concertFs = Number(object.concertFs);
            if (object.museum != null)
                message.museum = Number(object.museum);
            return message;
        };

        /**
         * Creates a plain object from an Events message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Events
         * @static
         * @param {synthpop.Events} message Events
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Events.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.sport = 0;
                object.rugby = 0;
                object.concertM = 0;
                object.concertF = 0;
                object.concertMs = 0;
                object.concertFs = 0;
                object.museum = 0;
            }
            if (message.sport != null && message.hasOwnProperty("sport"))
                object.sport = options.json && !isFinite(message.sport) ? String(message.sport) : message.sport;
            if (message.rugby != null && message.hasOwnProperty("rugby"))
                object.rugby = options.json && !isFinite(message.rugby) ? String(message.rugby) : message.rugby;
            if (message.concertM != null && message.hasOwnProperty("concertM"))
                object.concertM = options.json && !isFinite(message.concertM) ? String(message.concertM) : message.concertM;
            if (message.concertF != null && message.hasOwnProperty("concertF"))
                object.concertF = options.json && !isFinite(message.concertF) ? String(message.concertF) : message.concertF;
            if (message.concertMs != null && message.hasOwnProperty("concertMs"))
                object.concertMs = options.json && !isFinite(message.concertMs) ? String(message.concertMs) : message.concertMs;
            if (message.concertFs != null && message.hasOwnProperty("concertFs"))
                object.concertFs = options.json && !isFinite(message.concertFs) ? String(message.concertFs) : message.concertFs;
            if (message.museum != null && message.hasOwnProperty("museum"))
                object.museum = options.json && !isFinite(message.museum) ? String(message.museum) : message.museum;
            return object;
        };

        /**
         * Converts this Events to JSON.
         * @function toJSON
         * @memberof synthpop.Events
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Events.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Events
         * @function getTypeUrl
         * @memberof synthpop.Events
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Events.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Events";
        };

        return Events;
    })();

    synthpop.Flows = (function() {

        /**
         * Properties of a Flows.
         * @memberof synthpop
         * @interface IFlows
         * @property {synthpop.Activity} activity Flows activity
         * @property {Array.<synthpop.IFlow>|null} [flows] Flows flows
         */

        /**
         * Constructs a new Flows.
         * @memberof synthpop
         * @classdesc Represents a Flows.
         * @implements IFlows
         * @constructor
         * @param {synthpop.IFlows=} [properties] Properties to set
         */
        function Flows(properties) {
            this.flows = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Flows activity.
         * @member {synthpop.Activity} activity
         * @memberof synthpop.Flows
         * @instance
         */
        Flows.prototype.activity = 0;

        /**
         * Flows flows.
         * @member {Array.<synthpop.IFlow>} flows
         * @memberof synthpop.Flows
         * @instance
         */
        Flows.prototype.flows = $util.emptyArray;

        /**
         * Creates a new Flows instance using the specified properties.
         * @function create
         * @memberof synthpop.Flows
         * @static
         * @param {synthpop.IFlows=} [properties] Properties to set
         * @returns {synthpop.Flows} Flows instance
         */
        Flows.create = function create(properties) {
            return new Flows(properties);
        };

        /**
         * Encodes the specified Flows message. Does not implicitly {@link synthpop.Flows.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Flows
         * @static
         * @param {synthpop.IFlows} message Flows message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Flows.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.activity);
            if (message.flows != null && message.flows.length)
                for (let i = 0; i < message.flows.length; ++i)
                    $root.synthpop.Flow.encode(message.flows[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Flows message, length delimited. Does not implicitly {@link synthpop.Flows.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Flows
         * @static
         * @param {synthpop.IFlows} message Flows message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Flows.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Flows message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Flows
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Flows} Flows
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Flows.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Flows();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.activity = reader.int32();
                        break;
                    }
                case 2: {
                        if (!(message.flows && message.flows.length))
                            message.flows = [];
                        message.flows.push($root.synthpop.Flow.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("activity"))
                throw $util.ProtocolError("missing required 'activity'", { instance: message });
            return message;
        };

        /**
         * Decodes a Flows message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Flows
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Flows} Flows
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Flows.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Flows message.
         * @function verify
         * @memberof synthpop.Flows
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Flows.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            switch (message.activity) {
            default:
                return "activity: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                break;
            }
            if (message.flows != null && message.hasOwnProperty("flows")) {
                if (!Array.isArray(message.flows))
                    return "flows: array expected";
                for (let i = 0; i < message.flows.length; ++i) {
                    let error = $root.synthpop.Flow.verify(message.flows[i]);
                    if (error)
                        return "flows." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Flows message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Flows
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Flows} Flows
         */
        Flows.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Flows)
                return object;
            let message = new $root.synthpop.Flows();
            switch (object.activity) {
            default:
                if (typeof object.activity === "number") {
                    message.activity = object.activity;
                    break;
                }
                break;
            case "RETAIL":
            case 0:
                message.activity = 0;
                break;
            case "PRIMARY_SCHOOL":
            case 1:
                message.activity = 1;
                break;
            case "SECONDARY_SCHOOL":
            case 2:
                message.activity = 2;
                break;
            case "HOME":
            case 3:
                message.activity = 3;
                break;
            case "WORK":
            case 4:
                message.activity = 4;
                break;
            }
            if (object.flows) {
                if (!Array.isArray(object.flows))
                    throw TypeError(".synthpop.Flows.flows: array expected");
                message.flows = [];
                for (let i = 0; i < object.flows.length; ++i) {
                    if (typeof object.flows[i] !== "object")
                        throw TypeError(".synthpop.Flows.flows: object expected");
                    message.flows[i] = $root.synthpop.Flow.fromObject(object.flows[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Flows message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Flows
         * @static
         * @param {synthpop.Flows} message Flows
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Flows.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.flows = [];
            if (options.defaults)
                object.activity = options.enums === String ? "RETAIL" : 0;
            if (message.activity != null && message.hasOwnProperty("activity"))
                object.activity = options.enums === String ? $root.synthpop.Activity[message.activity] === undefined ? message.activity : $root.synthpop.Activity[message.activity] : message.activity;
            if (message.flows && message.flows.length) {
                object.flows = [];
                for (let j = 0; j < message.flows.length; ++j)
                    object.flows[j] = $root.synthpop.Flow.toObject(message.flows[j], options);
            }
            return object;
        };

        /**
         * Converts this Flows to JSON.
         * @function toJSON
         * @memberof synthpop.Flows
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Flows.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Flows
         * @function getTypeUrl
         * @memberof synthpop.Flows
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Flows.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Flows";
        };

        return Flows;
    })();

    synthpop.Flow = (function() {

        /**
         * Properties of a Flow.
         * @memberof synthpop
         * @interface IFlow
         * @property {number|Long} venueId Flow venueId
         * @property {number} weight Flow weight
         */

        /**
         * Constructs a new Flow.
         * @memberof synthpop
         * @classdesc Represents a Flow.
         * @implements IFlow
         * @constructor
         * @param {synthpop.IFlow=} [properties] Properties to set
         */
        function Flow(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Flow venueId.
         * @member {number|Long} venueId
         * @memberof synthpop.Flow
         * @instance
         */
        Flow.prototype.venueId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Flow weight.
         * @member {number} weight
         * @memberof synthpop.Flow
         * @instance
         */
        Flow.prototype.weight = 0;

        /**
         * Creates a new Flow instance using the specified properties.
         * @function create
         * @memberof synthpop.Flow
         * @static
         * @param {synthpop.IFlow=} [properties] Properties to set
         * @returns {synthpop.Flow} Flow instance
         */
        Flow.create = function create(properties) {
            return new Flow(properties);
        };

        /**
         * Encodes the specified Flow message. Does not implicitly {@link synthpop.Flow.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Flow
         * @static
         * @param {synthpop.IFlow} message Flow message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Flow.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.venueId);
            writer.uint32(/* id 2, wireType 1 =*/17).double(message.weight);
            return writer;
        };

        /**
         * Encodes the specified Flow message, length delimited. Does not implicitly {@link synthpop.Flow.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Flow
         * @static
         * @param {synthpop.IFlow} message Flow message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Flow.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Flow message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Flow
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Flow} Flow
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Flow.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Flow();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.venueId = reader.uint64();
                        break;
                    }
                case 2: {
                        message.weight = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("venueId"))
                throw $util.ProtocolError("missing required 'venueId'", { instance: message });
            if (!message.hasOwnProperty("weight"))
                throw $util.ProtocolError("missing required 'weight'", { instance: message });
            return message;
        };

        /**
         * Decodes a Flow message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Flow
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Flow} Flow
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Flow.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Flow message.
         * @function verify
         * @memberof synthpop.Flow
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Flow.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.venueId) && !(message.venueId && $util.isInteger(message.venueId.low) && $util.isInteger(message.venueId.high)))
                return "venueId: integer|Long expected";
            if (typeof message.weight !== "number")
                return "weight: number expected";
            return null;
        };

        /**
         * Creates a Flow message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Flow
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Flow} Flow
         */
        Flow.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Flow)
                return object;
            let message = new $root.synthpop.Flow();
            if (object.venueId != null)
                if ($util.Long)
                    (message.venueId = $util.Long.fromValue(object.venueId)).unsigned = true;
                else if (typeof object.venueId === "string")
                    message.venueId = parseInt(object.venueId, 10);
                else if (typeof object.venueId === "number")
                    message.venueId = object.venueId;
                else if (typeof object.venueId === "object")
                    message.venueId = new $util.LongBits(object.venueId.low >>> 0, object.venueId.high >>> 0).toNumber(true);
            if (object.weight != null)
                message.weight = Number(object.weight);
            return message;
        };

        /**
         * Creates a plain object from a Flow message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Flow
         * @static
         * @param {synthpop.Flow} message Flow
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Flow.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.venueId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.venueId = options.longs === String ? "0" : 0;
                object.weight = 0;
            }
            if (message.venueId != null && message.hasOwnProperty("venueId"))
                if (typeof message.venueId === "number")
                    object.venueId = options.longs === String ? String(message.venueId) : message.venueId;
                else
                    object.venueId = options.longs === String ? $util.Long.prototype.toString.call(message.venueId) : options.longs === Number ? new $util.LongBits(message.venueId.low >>> 0, message.venueId.high >>> 0).toNumber(true) : message.venueId;
            if (message.weight != null && message.hasOwnProperty("weight"))
                object.weight = options.json && !isFinite(message.weight) ? String(message.weight) : message.weight;
            return object;
        };

        /**
         * Converts this Flow to JSON.
         * @function toJSON
         * @memberof synthpop.Flow
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Flow.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Flow
         * @function getTypeUrl
         * @memberof synthpop.Flow
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Flow.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Flow";
        };

        return Flow;
    })();

    synthpop.Venue = (function() {

        /**
         * Properties of a Venue.
         * @memberof synthpop
         * @interface IVenue
         * @property {number|Long} id Venue id
         * @property {synthpop.Activity} activity Venue activity
         * @property {synthpop.IPoint} location Venue location
         * @property {string|null} [urn] Venue urn
         */

        /**
         * Constructs a new Venue.
         * @memberof synthpop
         * @classdesc Represents a Venue.
         * @implements IVenue
         * @constructor
         * @param {synthpop.IVenue=} [properties] Properties to set
         */
        function Venue(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Venue id.
         * @member {number|Long} id
         * @memberof synthpop.Venue
         * @instance
         */
        Venue.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Venue activity.
         * @member {synthpop.Activity} activity
         * @memberof synthpop.Venue
         * @instance
         */
        Venue.prototype.activity = 0;

        /**
         * Venue location.
         * @member {synthpop.IPoint} location
         * @memberof synthpop.Venue
         * @instance
         */
        Venue.prototype.location = null;

        /**
         * Venue urn.
         * @member {string} urn
         * @memberof synthpop.Venue
         * @instance
         */
        Venue.prototype.urn = "";

        /**
         * Creates a new Venue instance using the specified properties.
         * @function create
         * @memberof synthpop.Venue
         * @static
         * @param {synthpop.IVenue=} [properties] Properties to set
         * @returns {synthpop.Venue} Venue instance
         */
        Venue.create = function create(properties) {
            return new Venue(properties);
        };

        /**
         * Encodes the specified Venue message. Does not implicitly {@link synthpop.Venue.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Venue
         * @static
         * @param {synthpop.IVenue} message Venue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Venue.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.activity);
            $root.synthpop.Point.encode(message.location, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.urn != null && Object.hasOwnProperty.call(message, "urn"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.urn);
            return writer;
        };

        /**
         * Encodes the specified Venue message, length delimited. Does not implicitly {@link synthpop.Venue.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Venue
         * @static
         * @param {synthpop.IVenue} message Venue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Venue.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Venue message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Venue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Venue} Venue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Venue.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Venue();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.activity = reader.int32();
                        break;
                    }
                case 3: {
                        message.location = $root.synthpop.Point.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.urn = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("activity"))
                throw $util.ProtocolError("missing required 'activity'", { instance: message });
            if (!message.hasOwnProperty("location"))
                throw $util.ProtocolError("missing required 'location'", { instance: message });
            return message;
        };

        /**
         * Decodes a Venue message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Venue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Venue} Venue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Venue.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Venue message.
         * @function verify
         * @memberof synthpop.Venue
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Venue.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                return "id: integer|Long expected";
            switch (message.activity) {
            default:
                return "activity: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                break;
            }
            {
                let error = $root.synthpop.Point.verify(message.location);
                if (error)
                    return "location." + error;
            }
            if (message.urn != null && message.hasOwnProperty("urn"))
                if (!$util.isString(message.urn))
                    return "urn: string expected";
            return null;
        };

        /**
         * Creates a Venue message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Venue
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Venue} Venue
         */
        Venue.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Venue)
                return object;
            let message = new $root.synthpop.Venue();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            switch (object.activity) {
            default:
                if (typeof object.activity === "number") {
                    message.activity = object.activity;
                    break;
                }
                break;
            case "RETAIL":
            case 0:
                message.activity = 0;
                break;
            case "PRIMARY_SCHOOL":
            case 1:
                message.activity = 1;
                break;
            case "SECONDARY_SCHOOL":
            case 2:
                message.activity = 2;
                break;
            case "HOME":
            case 3:
                message.activity = 3;
                break;
            case "WORK":
            case 4:
                message.activity = 4;
                break;
            }
            if (object.location != null) {
                if (typeof object.location !== "object")
                    throw TypeError(".synthpop.Venue.location: object expected");
                message.location = $root.synthpop.Point.fromObject(object.location);
            }
            if (object.urn != null)
                message.urn = String(object.urn);
            return message;
        };

        /**
         * Creates a plain object from a Venue message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Venue
         * @static
         * @param {synthpop.Venue} message Venue
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Venue.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.activity = options.enums === String ? "RETAIL" : 0;
                object.location = null;
                object.urn = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.activity != null && message.hasOwnProperty("activity"))
                object.activity = options.enums === String ? $root.synthpop.Activity[message.activity] === undefined ? message.activity : $root.synthpop.Activity[message.activity] : message.activity;
            if (message.location != null && message.hasOwnProperty("location"))
                object.location = $root.synthpop.Point.toObject(message.location, options);
            if (message.urn != null && message.hasOwnProperty("urn"))
                object.urn = message.urn;
            return object;
        };

        /**
         * Converts this Venue to JSON.
         * @function toJSON
         * @memberof synthpop.Venue
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Venue.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Venue
         * @function getTypeUrl
         * @memberof synthpop.Venue
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Venue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Venue";
        };

        return Venue;
    })();

    /**
     * Activity enum.
     * @name synthpop.Activity
     * @enum {number}
     * @property {number} RETAIL=0 RETAIL value
     * @property {number} PRIMARY_SCHOOL=1 PRIMARY_SCHOOL value
     * @property {number} SECONDARY_SCHOOL=2 SECONDARY_SCHOOL value
     * @property {number} HOME=3 HOME value
     * @property {number} WORK=4 WORK value
     */
    synthpop.Activity = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "RETAIL"] = 0;
        values[valuesById[1] = "PRIMARY_SCHOOL"] = 1;
        values[valuesById[2] = "SECONDARY_SCHOOL"] = 2;
        values[valuesById[3] = "HOME"] = 3;
        values[valuesById[4] = "WORK"] = 4;
        return values;
    })();

    synthpop.Lockdown = (function() {

        /**
         * Properties of a Lockdown.
         * @memberof synthpop
         * @interface ILockdown
         * @property {string} startDate Lockdown startDate
         * @property {Array.<number>|null} [changePerDay] Lockdown changePerDay
         */

        /**
         * Constructs a new Lockdown.
         * @memberof synthpop
         * @classdesc Represents a Lockdown.
         * @implements ILockdown
         * @constructor
         * @param {synthpop.ILockdown=} [properties] Properties to set
         */
        function Lockdown(properties) {
            this.changePerDay = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Lockdown startDate.
         * @member {string} startDate
         * @memberof synthpop.Lockdown
         * @instance
         */
        Lockdown.prototype.startDate = "";

        /**
         * Lockdown changePerDay.
         * @member {Array.<number>} changePerDay
         * @memberof synthpop.Lockdown
         * @instance
         */
        Lockdown.prototype.changePerDay = $util.emptyArray;

        /**
         * Creates a new Lockdown instance using the specified properties.
         * @function create
         * @memberof synthpop.Lockdown
         * @static
         * @param {synthpop.ILockdown=} [properties] Properties to set
         * @returns {synthpop.Lockdown} Lockdown instance
         */
        Lockdown.create = function create(properties) {
            return new Lockdown(properties);
        };

        /**
         * Encodes the specified Lockdown message. Does not implicitly {@link synthpop.Lockdown.verify|verify} messages.
         * @function encode
         * @memberof synthpop.Lockdown
         * @static
         * @param {synthpop.ILockdown} message Lockdown message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Lockdown.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.startDate);
            if (message.changePerDay != null && message.changePerDay.length)
                for (let i = 0; i < message.changePerDay.length; ++i)
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.changePerDay[i]);
            return writer;
        };

        /**
         * Encodes the specified Lockdown message, length delimited. Does not implicitly {@link synthpop.Lockdown.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.Lockdown
         * @static
         * @param {synthpop.ILockdown} message Lockdown message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Lockdown.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Lockdown message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.Lockdown
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.Lockdown} Lockdown
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Lockdown.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.Lockdown();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.startDate = reader.string();
                        break;
                    }
                case 2: {
                        if (!(message.changePerDay && message.changePerDay.length))
                            message.changePerDay = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.changePerDay.push(reader.float());
                        } else
                            message.changePerDay.push(reader.float());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("startDate"))
                throw $util.ProtocolError("missing required 'startDate'", { instance: message });
            return message;
        };

        /**
         * Decodes a Lockdown message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.Lockdown
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.Lockdown} Lockdown
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Lockdown.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Lockdown message.
         * @function verify
         * @memberof synthpop.Lockdown
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Lockdown.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.startDate))
                return "startDate: string expected";
            if (message.changePerDay != null && message.hasOwnProperty("changePerDay")) {
                if (!Array.isArray(message.changePerDay))
                    return "changePerDay: array expected";
                for (let i = 0; i < message.changePerDay.length; ++i)
                    if (typeof message.changePerDay[i] !== "number")
                        return "changePerDay: number[] expected";
            }
            return null;
        };

        /**
         * Creates a Lockdown message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.Lockdown
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.Lockdown} Lockdown
         */
        Lockdown.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.Lockdown)
                return object;
            let message = new $root.synthpop.Lockdown();
            if (object.startDate != null)
                message.startDate = String(object.startDate);
            if (object.changePerDay) {
                if (!Array.isArray(object.changePerDay))
                    throw TypeError(".synthpop.Lockdown.changePerDay: array expected");
                message.changePerDay = [];
                for (let i = 0; i < object.changePerDay.length; ++i)
                    message.changePerDay[i] = Number(object.changePerDay[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a Lockdown message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.Lockdown
         * @static
         * @param {synthpop.Lockdown} message Lockdown
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Lockdown.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.changePerDay = [];
            if (options.defaults)
                object.startDate = "";
            if (message.startDate != null && message.hasOwnProperty("startDate"))
                object.startDate = message.startDate;
            if (message.changePerDay && message.changePerDay.length) {
                object.changePerDay = [];
                for (let j = 0; j < message.changePerDay.length; ++j)
                    object.changePerDay[j] = options.json && !isFinite(message.changePerDay[j]) ? String(message.changePerDay[j]) : message.changePerDay[j];
            }
            return object;
        };

        /**
         * Converts this Lockdown to JSON.
         * @function toJSON
         * @memberof synthpop.Lockdown
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Lockdown.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Lockdown
         * @function getTypeUrl
         * @memberof synthpop.Lockdown
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Lockdown.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.Lockdown";
        };

        return Lockdown;
    })();

    synthpop.TimeUseDiary = (function() {

        /**
         * Properties of a TimeUseDiary.
         * @memberof synthpop
         * @interface ITimeUseDiary
         * @property {string} uid TimeUseDiary uid
         * @property {boolean} weekday TimeUseDiary weekday
         * @property {number} dayType TimeUseDiary dayType
         * @property {number} month TimeUseDiary month
         * @property {number} pworkhome TimeUseDiary pworkhome
         * @property {number} phomeother TimeUseDiary phomeother
         * @property {number} pwork TimeUseDiary pwork
         * @property {number} pschool TimeUseDiary pschool
         * @property {number} pshop TimeUseDiary pshop
         * @property {number} pservices TimeUseDiary pservices
         * @property {number} pleisure TimeUseDiary pleisure
         * @property {number} pescort TimeUseDiary pescort
         * @property {number} ptransport TimeUseDiary ptransport
         * @property {number} phomeTotal TimeUseDiary phomeTotal
         * @property {number} pnothomeTotal TimeUseDiary pnothomeTotal
         * @property {number} punknownTotal TimeUseDiary punknownTotal
         * @property {number} pmwalk TimeUseDiary pmwalk
         * @property {number} pmcycle TimeUseDiary pmcycle
         * @property {number} pmprivate TimeUseDiary pmprivate
         * @property {number} pmpublic TimeUseDiary pmpublic
         * @property {number} pmunknown TimeUseDiary pmunknown
         * @property {synthpop.Sex} sex TimeUseDiary sex
         * @property {number} age35g TimeUseDiary age35g
         * @property {synthpop.Nssec8|null} [nssec8] TimeUseDiary nssec8
         * @property {synthpop.PwkStat} pwkstat TimeUseDiary pwkstat
         */

        /**
         * Constructs a new TimeUseDiary.
         * @memberof synthpop
         * @classdesc Represents a TimeUseDiary.
         * @implements ITimeUseDiary
         * @constructor
         * @param {synthpop.ITimeUseDiary=} [properties] Properties to set
         */
        function TimeUseDiary(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TimeUseDiary uid.
         * @member {string} uid
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.uid = "";

        /**
         * TimeUseDiary weekday.
         * @member {boolean} weekday
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.weekday = false;

        /**
         * TimeUseDiary dayType.
         * @member {number} dayType
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.dayType = 0;

        /**
         * TimeUseDiary month.
         * @member {number} month
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.month = 0;

        /**
         * TimeUseDiary pworkhome.
         * @member {number} pworkhome
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pworkhome = 0;

        /**
         * TimeUseDiary phomeother.
         * @member {number} phomeother
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.phomeother = 0;

        /**
         * TimeUseDiary pwork.
         * @member {number} pwork
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pwork = 0;

        /**
         * TimeUseDiary pschool.
         * @member {number} pschool
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pschool = 0;

        /**
         * TimeUseDiary pshop.
         * @member {number} pshop
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pshop = 0;

        /**
         * TimeUseDiary pservices.
         * @member {number} pservices
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pservices = 0;

        /**
         * TimeUseDiary pleisure.
         * @member {number} pleisure
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pleisure = 0;

        /**
         * TimeUseDiary pescort.
         * @member {number} pescort
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pescort = 0;

        /**
         * TimeUseDiary ptransport.
         * @member {number} ptransport
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.ptransport = 0;

        /**
         * TimeUseDiary phomeTotal.
         * @member {number} phomeTotal
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.phomeTotal = 0;

        /**
         * TimeUseDiary pnothomeTotal.
         * @member {number} pnothomeTotal
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pnothomeTotal = 0;

        /**
         * TimeUseDiary punknownTotal.
         * @member {number} punknownTotal
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.punknownTotal = 0;

        /**
         * TimeUseDiary pmwalk.
         * @member {number} pmwalk
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pmwalk = 0;

        /**
         * TimeUseDiary pmcycle.
         * @member {number} pmcycle
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pmcycle = 0;

        /**
         * TimeUseDiary pmprivate.
         * @member {number} pmprivate
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pmprivate = 0;

        /**
         * TimeUseDiary pmpublic.
         * @member {number} pmpublic
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pmpublic = 0;

        /**
         * TimeUseDiary pmunknown.
         * @member {number} pmunknown
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pmunknown = 0;

        /**
         * TimeUseDiary sex.
         * @member {synthpop.Sex} sex
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.sex = 1;

        /**
         * TimeUseDiary age35g.
         * @member {number} age35g
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.age35g = 0;

        /**
         * TimeUseDiary nssec8.
         * @member {synthpop.Nssec8} nssec8
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.nssec8 = 1;

        /**
         * TimeUseDiary pwkstat.
         * @member {synthpop.PwkStat} pwkstat
         * @memberof synthpop.TimeUseDiary
         * @instance
         */
        TimeUseDiary.prototype.pwkstat = 0;

        /**
         * Creates a new TimeUseDiary instance using the specified properties.
         * @function create
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {synthpop.ITimeUseDiary=} [properties] Properties to set
         * @returns {synthpop.TimeUseDiary} TimeUseDiary instance
         */
        TimeUseDiary.create = function create(properties) {
            return new TimeUseDiary(properties);
        };

        /**
         * Encodes the specified TimeUseDiary message. Does not implicitly {@link synthpop.TimeUseDiary.verify|verify} messages.
         * @function encode
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {synthpop.ITimeUseDiary} message TimeUseDiary message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TimeUseDiary.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.uid);
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.weekday);
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.dayType);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.month);
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.pworkhome);
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.phomeother);
            writer.uint32(/* id 7, wireType 5 =*/61).float(message.pwork);
            writer.uint32(/* id 8, wireType 5 =*/69).float(message.pschool);
            writer.uint32(/* id 9, wireType 5 =*/77).float(message.pshop);
            writer.uint32(/* id 10, wireType 5 =*/85).float(message.pservices);
            writer.uint32(/* id 11, wireType 5 =*/93).float(message.pleisure);
            writer.uint32(/* id 12, wireType 5 =*/101).float(message.pescort);
            writer.uint32(/* id 13, wireType 5 =*/109).float(message.ptransport);
            writer.uint32(/* id 14, wireType 5 =*/117).float(message.phomeTotal);
            writer.uint32(/* id 15, wireType 5 =*/125).float(message.pnothomeTotal);
            writer.uint32(/* id 16, wireType 5 =*/133).float(message.punknownTotal);
            writer.uint32(/* id 17, wireType 5 =*/141).float(message.pmwalk);
            writer.uint32(/* id 18, wireType 5 =*/149).float(message.pmcycle);
            writer.uint32(/* id 19, wireType 5 =*/157).float(message.pmprivate);
            writer.uint32(/* id 20, wireType 5 =*/165).float(message.pmpublic);
            writer.uint32(/* id 21, wireType 5 =*/173).float(message.pmunknown);
            writer.uint32(/* id 22, wireType 0 =*/176).int32(message.sex);
            writer.uint32(/* id 23, wireType 0 =*/184).uint32(message.age35g);
            if (message.nssec8 != null && Object.hasOwnProperty.call(message, "nssec8"))
                writer.uint32(/* id 24, wireType 0 =*/192).int32(message.nssec8);
            writer.uint32(/* id 25, wireType 0 =*/200).int32(message.pwkstat);
            return writer;
        };

        /**
         * Encodes the specified TimeUseDiary message, length delimited. Does not implicitly {@link synthpop.TimeUseDiary.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {synthpop.ITimeUseDiary} message TimeUseDiary message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TimeUseDiary.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TimeUseDiary message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.TimeUseDiary} TimeUseDiary
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TimeUseDiary.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.TimeUseDiary();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.uid = reader.string();
                        break;
                    }
                case 2: {
                        message.weekday = reader.bool();
                        break;
                    }
                case 3: {
                        message.dayType = reader.int32();
                        break;
                    }
                case 4: {
                        message.month = reader.uint32();
                        break;
                    }
                case 5: {
                        message.pworkhome = reader.float();
                        break;
                    }
                case 6: {
                        message.phomeother = reader.float();
                        break;
                    }
                case 7: {
                        message.pwork = reader.float();
                        break;
                    }
                case 8: {
                        message.pschool = reader.float();
                        break;
                    }
                case 9: {
                        message.pshop = reader.float();
                        break;
                    }
                case 10: {
                        message.pservices = reader.float();
                        break;
                    }
                case 11: {
                        message.pleisure = reader.float();
                        break;
                    }
                case 12: {
                        message.pescort = reader.float();
                        break;
                    }
                case 13: {
                        message.ptransport = reader.float();
                        break;
                    }
                case 14: {
                        message.phomeTotal = reader.float();
                        break;
                    }
                case 15: {
                        message.pnothomeTotal = reader.float();
                        break;
                    }
                case 16: {
                        message.punknownTotal = reader.float();
                        break;
                    }
                case 17: {
                        message.pmwalk = reader.float();
                        break;
                    }
                case 18: {
                        message.pmcycle = reader.float();
                        break;
                    }
                case 19: {
                        message.pmprivate = reader.float();
                        break;
                    }
                case 20: {
                        message.pmpublic = reader.float();
                        break;
                    }
                case 21: {
                        message.pmunknown = reader.float();
                        break;
                    }
                case 22: {
                        message.sex = reader.int32();
                        break;
                    }
                case 23: {
                        message.age35g = reader.uint32();
                        break;
                    }
                case 24: {
                        message.nssec8 = reader.int32();
                        break;
                    }
                case 25: {
                        message.pwkstat = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("uid"))
                throw $util.ProtocolError("missing required 'uid'", { instance: message });
            if (!message.hasOwnProperty("weekday"))
                throw $util.ProtocolError("missing required 'weekday'", { instance: message });
            if (!message.hasOwnProperty("dayType"))
                throw $util.ProtocolError("missing required 'dayType'", { instance: message });
            if (!message.hasOwnProperty("month"))
                throw $util.ProtocolError("missing required 'month'", { instance: message });
            if (!message.hasOwnProperty("pworkhome"))
                throw $util.ProtocolError("missing required 'pworkhome'", { instance: message });
            if (!message.hasOwnProperty("phomeother"))
                throw $util.ProtocolError("missing required 'phomeother'", { instance: message });
            if (!message.hasOwnProperty("pwork"))
                throw $util.ProtocolError("missing required 'pwork'", { instance: message });
            if (!message.hasOwnProperty("pschool"))
                throw $util.ProtocolError("missing required 'pschool'", { instance: message });
            if (!message.hasOwnProperty("pshop"))
                throw $util.ProtocolError("missing required 'pshop'", { instance: message });
            if (!message.hasOwnProperty("pservices"))
                throw $util.ProtocolError("missing required 'pservices'", { instance: message });
            if (!message.hasOwnProperty("pleisure"))
                throw $util.ProtocolError("missing required 'pleisure'", { instance: message });
            if (!message.hasOwnProperty("pescort"))
                throw $util.ProtocolError("missing required 'pescort'", { instance: message });
            if (!message.hasOwnProperty("ptransport"))
                throw $util.ProtocolError("missing required 'ptransport'", { instance: message });
            if (!message.hasOwnProperty("phomeTotal"))
                throw $util.ProtocolError("missing required 'phomeTotal'", { instance: message });
            if (!message.hasOwnProperty("pnothomeTotal"))
                throw $util.ProtocolError("missing required 'pnothomeTotal'", { instance: message });
            if (!message.hasOwnProperty("punknownTotal"))
                throw $util.ProtocolError("missing required 'punknownTotal'", { instance: message });
            if (!message.hasOwnProperty("pmwalk"))
                throw $util.ProtocolError("missing required 'pmwalk'", { instance: message });
            if (!message.hasOwnProperty("pmcycle"))
                throw $util.ProtocolError("missing required 'pmcycle'", { instance: message });
            if (!message.hasOwnProperty("pmprivate"))
                throw $util.ProtocolError("missing required 'pmprivate'", { instance: message });
            if (!message.hasOwnProperty("pmpublic"))
                throw $util.ProtocolError("missing required 'pmpublic'", { instance: message });
            if (!message.hasOwnProperty("pmunknown"))
                throw $util.ProtocolError("missing required 'pmunknown'", { instance: message });
            if (!message.hasOwnProperty("sex"))
                throw $util.ProtocolError("missing required 'sex'", { instance: message });
            if (!message.hasOwnProperty("age35g"))
                throw $util.ProtocolError("missing required 'age35g'", { instance: message });
            if (!message.hasOwnProperty("pwkstat"))
                throw $util.ProtocolError("missing required 'pwkstat'", { instance: message });
            return message;
        };

        /**
         * Decodes a TimeUseDiary message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.TimeUseDiary} TimeUseDiary
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TimeUseDiary.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TimeUseDiary message.
         * @function verify
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TimeUseDiary.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.uid))
                return "uid: string expected";
            if (typeof message.weekday !== "boolean")
                return "weekday: boolean expected";
            if (!$util.isInteger(message.dayType))
                return "dayType: integer expected";
            if (!$util.isInteger(message.month))
                return "month: integer expected";
            if (typeof message.pworkhome !== "number")
                return "pworkhome: number expected";
            if (typeof message.phomeother !== "number")
                return "phomeother: number expected";
            if (typeof message.pwork !== "number")
                return "pwork: number expected";
            if (typeof message.pschool !== "number")
                return "pschool: number expected";
            if (typeof message.pshop !== "number")
                return "pshop: number expected";
            if (typeof message.pservices !== "number")
                return "pservices: number expected";
            if (typeof message.pleisure !== "number")
                return "pleisure: number expected";
            if (typeof message.pescort !== "number")
                return "pescort: number expected";
            if (typeof message.ptransport !== "number")
                return "ptransport: number expected";
            if (typeof message.phomeTotal !== "number")
                return "phomeTotal: number expected";
            if (typeof message.pnothomeTotal !== "number")
                return "pnothomeTotal: number expected";
            if (typeof message.punknownTotal !== "number")
                return "punknownTotal: number expected";
            if (typeof message.pmwalk !== "number")
                return "pmwalk: number expected";
            if (typeof message.pmcycle !== "number")
                return "pmcycle: number expected";
            if (typeof message.pmprivate !== "number")
                return "pmprivate: number expected";
            if (typeof message.pmpublic !== "number")
                return "pmpublic: number expected";
            if (typeof message.pmunknown !== "number")
                return "pmunknown: number expected";
            switch (message.sex) {
            default:
                return "sex: enum value expected";
            case 1:
            case 2:
                break;
            }
            if (!$util.isInteger(message.age35g))
                return "age35g: integer expected";
            if (message.nssec8 != null && message.hasOwnProperty("nssec8"))
                switch (message.nssec8) {
                default:
                    return "nssec8: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            switch (message.pwkstat) {
            default:
                return "pwkstat: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                break;
            }
            return null;
        };

        /**
         * Creates a TimeUseDiary message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.TimeUseDiary} TimeUseDiary
         */
        TimeUseDiary.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.TimeUseDiary)
                return object;
            let message = new $root.synthpop.TimeUseDiary();
            if (object.uid != null)
                message.uid = String(object.uid);
            if (object.weekday != null)
                message.weekday = Boolean(object.weekday);
            if (object.dayType != null)
                message.dayType = object.dayType | 0;
            if (object.month != null)
                message.month = object.month >>> 0;
            if (object.pworkhome != null)
                message.pworkhome = Number(object.pworkhome);
            if (object.phomeother != null)
                message.phomeother = Number(object.phomeother);
            if (object.pwork != null)
                message.pwork = Number(object.pwork);
            if (object.pschool != null)
                message.pschool = Number(object.pschool);
            if (object.pshop != null)
                message.pshop = Number(object.pshop);
            if (object.pservices != null)
                message.pservices = Number(object.pservices);
            if (object.pleisure != null)
                message.pleisure = Number(object.pleisure);
            if (object.pescort != null)
                message.pescort = Number(object.pescort);
            if (object.ptransport != null)
                message.ptransport = Number(object.ptransport);
            if (object.phomeTotal != null)
                message.phomeTotal = Number(object.phomeTotal);
            if (object.pnothomeTotal != null)
                message.pnothomeTotal = Number(object.pnothomeTotal);
            if (object.punknownTotal != null)
                message.punknownTotal = Number(object.punknownTotal);
            if (object.pmwalk != null)
                message.pmwalk = Number(object.pmwalk);
            if (object.pmcycle != null)
                message.pmcycle = Number(object.pmcycle);
            if (object.pmprivate != null)
                message.pmprivate = Number(object.pmprivate);
            if (object.pmpublic != null)
                message.pmpublic = Number(object.pmpublic);
            if (object.pmunknown != null)
                message.pmunknown = Number(object.pmunknown);
            switch (object.sex) {
            default:
                if (typeof object.sex === "number") {
                    message.sex = object.sex;
                    break;
                }
                break;
            case "MALE":
            case 1:
                message.sex = 1;
                break;
            case "FEMALE":
            case 2:
                message.sex = 2;
                break;
            }
            if (object.age35g != null)
                message.age35g = object.age35g >>> 0;
            switch (object.nssec8) {
            default:
                if (typeof object.nssec8 === "number") {
                    message.nssec8 = object.nssec8;
                    break;
                }
                break;
            case "HIGHER":
            case 1:
                message.nssec8 = 1;
                break;
            case "LOWER":
            case 2:
                message.nssec8 = 2;
                break;
            case "INTERMEDIATE":
            case 3:
                message.nssec8 = 3;
                break;
            case "SMALL":
            case 4:
                message.nssec8 = 4;
                break;
            case "SUPER":
            case 5:
                message.nssec8 = 5;
                break;
            case "SEMIROUTINE":
            case 6:
                message.nssec8 = 6;
                break;
            case "ROUTINE":
            case 7:
                message.nssec8 = 7;
                break;
            case "NEVER":
            case 8:
                message.nssec8 = 8;
                break;
            }
            switch (object.pwkstat) {
            default:
                if (typeof object.pwkstat === "number") {
                    message.pwkstat = object.pwkstat;
                    break;
                }
                break;
            case "NA":
            case 0:
                message.pwkstat = 0;
                break;
            case "EMPLOYEE_FT":
            case 1:
                message.pwkstat = 1;
                break;
            case "EMPLOYEE_PT":
            case 2:
                message.pwkstat = 2;
                break;
            case "EMPLOYEE_UNSPEC":
            case 3:
                message.pwkstat = 3;
                break;
            case "SELF_EMPLOYED":
            case 4:
                message.pwkstat = 4;
                break;
            case "PWK_UNEMPLOYED":
            case 5:
                message.pwkstat = 5;
                break;
            case "RETIRED":
            case 6:
                message.pwkstat = 6;
                break;
            case "HOMEMAKER":
            case 7:
                message.pwkstat = 7;
                break;
            case "STUDENT_FT":
            case 8:
                message.pwkstat = 8;
                break;
            case "LONG_TERM_SICK":
            case 9:
                message.pwkstat = 9;
                break;
            case "PWK_OTHER":
            case 10:
                message.pwkstat = 10;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a TimeUseDiary message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {synthpop.TimeUseDiary} message TimeUseDiary
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TimeUseDiary.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.uid = "";
                object.weekday = false;
                object.dayType = 0;
                object.month = 0;
                object.pworkhome = 0;
                object.phomeother = 0;
                object.pwork = 0;
                object.pschool = 0;
                object.pshop = 0;
                object.pservices = 0;
                object.pleisure = 0;
                object.pescort = 0;
                object.ptransport = 0;
                object.phomeTotal = 0;
                object.pnothomeTotal = 0;
                object.punknownTotal = 0;
                object.pmwalk = 0;
                object.pmcycle = 0;
                object.pmprivate = 0;
                object.pmpublic = 0;
                object.pmunknown = 0;
                object.sex = options.enums === String ? "MALE" : 1;
                object.age35g = 0;
                object.nssec8 = options.enums === String ? "HIGHER" : 1;
                object.pwkstat = options.enums === String ? "NA" : 0;
            }
            if (message.uid != null && message.hasOwnProperty("uid"))
                object.uid = message.uid;
            if (message.weekday != null && message.hasOwnProperty("weekday"))
                object.weekday = message.weekday;
            if (message.dayType != null && message.hasOwnProperty("dayType"))
                object.dayType = message.dayType;
            if (message.month != null && message.hasOwnProperty("month"))
                object.month = message.month;
            if (message.pworkhome != null && message.hasOwnProperty("pworkhome"))
                object.pworkhome = options.json && !isFinite(message.pworkhome) ? String(message.pworkhome) : message.pworkhome;
            if (message.phomeother != null && message.hasOwnProperty("phomeother"))
                object.phomeother = options.json && !isFinite(message.phomeother) ? String(message.phomeother) : message.phomeother;
            if (message.pwork != null && message.hasOwnProperty("pwork"))
                object.pwork = options.json && !isFinite(message.pwork) ? String(message.pwork) : message.pwork;
            if (message.pschool != null && message.hasOwnProperty("pschool"))
                object.pschool = options.json && !isFinite(message.pschool) ? String(message.pschool) : message.pschool;
            if (message.pshop != null && message.hasOwnProperty("pshop"))
                object.pshop = options.json && !isFinite(message.pshop) ? String(message.pshop) : message.pshop;
            if (message.pservices != null && message.hasOwnProperty("pservices"))
                object.pservices = options.json && !isFinite(message.pservices) ? String(message.pservices) : message.pservices;
            if (message.pleisure != null && message.hasOwnProperty("pleisure"))
                object.pleisure = options.json && !isFinite(message.pleisure) ? String(message.pleisure) : message.pleisure;
            if (message.pescort != null && message.hasOwnProperty("pescort"))
                object.pescort = options.json && !isFinite(message.pescort) ? String(message.pescort) : message.pescort;
            if (message.ptransport != null && message.hasOwnProperty("ptransport"))
                object.ptransport = options.json && !isFinite(message.ptransport) ? String(message.ptransport) : message.ptransport;
            if (message.phomeTotal != null && message.hasOwnProperty("phomeTotal"))
                object.phomeTotal = options.json && !isFinite(message.phomeTotal) ? String(message.phomeTotal) : message.phomeTotal;
            if (message.pnothomeTotal != null && message.hasOwnProperty("pnothomeTotal"))
                object.pnothomeTotal = options.json && !isFinite(message.pnothomeTotal) ? String(message.pnothomeTotal) : message.pnothomeTotal;
            if (message.punknownTotal != null && message.hasOwnProperty("punknownTotal"))
                object.punknownTotal = options.json && !isFinite(message.punknownTotal) ? String(message.punknownTotal) : message.punknownTotal;
            if (message.pmwalk != null && message.hasOwnProperty("pmwalk"))
                object.pmwalk = options.json && !isFinite(message.pmwalk) ? String(message.pmwalk) : message.pmwalk;
            if (message.pmcycle != null && message.hasOwnProperty("pmcycle"))
                object.pmcycle = options.json && !isFinite(message.pmcycle) ? String(message.pmcycle) : message.pmcycle;
            if (message.pmprivate != null && message.hasOwnProperty("pmprivate"))
                object.pmprivate = options.json && !isFinite(message.pmprivate) ? String(message.pmprivate) : message.pmprivate;
            if (message.pmpublic != null && message.hasOwnProperty("pmpublic"))
                object.pmpublic = options.json && !isFinite(message.pmpublic) ? String(message.pmpublic) : message.pmpublic;
            if (message.pmunknown != null && message.hasOwnProperty("pmunknown"))
                object.pmunknown = options.json && !isFinite(message.pmunknown) ? String(message.pmunknown) : message.pmunknown;
            if (message.sex != null && message.hasOwnProperty("sex"))
                object.sex = options.enums === String ? $root.synthpop.Sex[message.sex] === undefined ? message.sex : $root.synthpop.Sex[message.sex] : message.sex;
            if (message.age35g != null && message.hasOwnProperty("age35g"))
                object.age35g = message.age35g;
            if (message.nssec8 != null && message.hasOwnProperty("nssec8"))
                object.nssec8 = options.enums === String ? $root.synthpop.Nssec8[message.nssec8] === undefined ? message.nssec8 : $root.synthpop.Nssec8[message.nssec8] : message.nssec8;
            if (message.pwkstat != null && message.hasOwnProperty("pwkstat"))
                object.pwkstat = options.enums === String ? $root.synthpop.PwkStat[message.pwkstat] === undefined ? message.pwkstat : $root.synthpop.PwkStat[message.pwkstat] : message.pwkstat;
            return object;
        };

        /**
         * Converts this TimeUseDiary to JSON.
         * @function toJSON
         * @memberof synthpop.TimeUseDiary
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TimeUseDiary.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TimeUseDiary
         * @function getTypeUrl
         * @memberof synthpop.TimeUseDiary
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TimeUseDiary.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.TimeUseDiary";
        };

        return TimeUseDiary;
    })();

    return synthpop;
})();

export { $root as default };
