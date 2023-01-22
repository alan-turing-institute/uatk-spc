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
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("lockdown"))
                throw $util.ProtocolError("missing required 'lockdown'", { instance: message });
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
            }
            if (options.objects || options.defaults) {
                object.venuesPerActivity = {};
                object.infoPerMsoa = {};
            }
            if (options.defaults)
                object.lockdown = null;
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
         * @property {number|Long} origHid An ID from the original data, kept around for debugging
         * @property {Array.<number|Long>|null} [members] Household members
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
         * An ID from the original data, kept around for debugging
         * @member {number|Long} origHid
         * @memberof synthpop.Household
         * @instance
         */
        Household.prototype.origHid = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Household members.
         * @member {Array.<number|Long>} members
         * @memberof synthpop.Household
         * @instance
         */
        Household.prototype.members = $util.emptyArray;

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
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.origHid);
            if (message.members != null && message.members.length)
                for (let i = 0; i < message.members.length; ++i)
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.members[i]);
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
                        message.origHid = reader.int64();
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
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("msoa11cd"))
                throw $util.ProtocolError("missing required 'msoa11cd'", { instance: message });
            if (!message.hasOwnProperty("origHid"))
                throw $util.ProtocolError("missing required 'origHid'", { instance: message });
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
            if (!$util.isInteger(message.origHid) && !(message.origHid && $util.isInteger(message.origHid.low) && $util.isInteger(message.origHid.high)))
                return "origHid: integer|Long expected";
            if (message.members != null && message.hasOwnProperty("members")) {
                if (!Array.isArray(message.members))
                    return "members: array expected";
                for (let i = 0; i < message.members.length; ++i)
                    if (!$util.isInteger(message.members[i]) && !(message.members[i] && $util.isInteger(message.members[i].low) && $util.isInteger(message.members[i].high)))
                        return "members: integer|Long[] expected";
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
            if (object.origHid != null)
                if ($util.Long)
                    (message.origHid = $util.Long.fromValue(object.origHid)).unsigned = false;
                else if (typeof object.origHid === "string")
                    message.origHid = parseInt(object.origHid, 10);
                else if (typeof object.origHid === "number")
                    message.origHid = object.origHid;
                else if (typeof object.origHid === "object")
                    message.origHid = new $util.LongBits(object.origHid.low >>> 0, object.origHid.high >>> 0).toNumber();
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
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.origHid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.origHid = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.msoa11cd != null && message.hasOwnProperty("msoa11cd"))
                object.msoa11cd = message.msoa11cd;
            if (message.origHid != null && message.hasOwnProperty("origHid"))
                if (typeof message.origHid === "number")
                    object.origHid = options.longs === String ? String(message.origHid) : message.origHid;
                else
                    object.origHid = options.longs === String ? $util.Long.prototype.toString.call(message.origHid) : options.longs === Number ? new $util.LongBits(message.origHid.low >>> 0, message.origHid.high >>> 0).toNumber() : message.origHid;
            if (message.members && message.members.length) {
                object.members = [];
                for (let j = 0; j < message.members.length; ++j)
                    if (typeof message.members[j] === "number")
                        object.members[j] = options.longs === String ? String(message.members[j]) : message.members[j];
                    else
                        object.members[j] = options.longs === String ? $util.Long.prototype.toString.call(message.members[j]) : options.longs === Number ? new $util.LongBits(message.members[j].low >>> 0, message.members[j].high >>> 0).toNumber(true) : message.members[j];
            }
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
         * @property {synthpop.ITimeUse} timeUse Person timeUse
         * @property {Array.<synthpop.IActivityDuration>|null} [activityDurations] Person activityDurations
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
            this.activityDurations = [];
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
         * Person timeUse.
         * @member {synthpop.ITimeUse} timeUse
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.timeUse = null;

        /**
         * Person activityDurations.
         * @member {Array.<synthpop.IActivityDuration>} activityDurations
         * @memberof synthpop.Person
         * @instance
         */
        Person.prototype.activityDurations = $util.emptyArray;

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
            $root.synthpop.TimeUse.encode(message.timeUse, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.activityDurations != null && message.activityDurations.length)
                for (let i = 0; i < message.activityDurations.length; ++i)
                    $root.synthpop.ActivityDuration.encode(message.activityDurations[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
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
                        message.timeUse = $root.synthpop.TimeUse.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        if (!(message.activityDurations && message.activityDurations.length))
                            message.activityDurations = [];
                        message.activityDurations.push($root.synthpop.ActivityDuration.decode(reader, reader.uint32()));
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
            if (!message.hasOwnProperty("timeUse"))
                throw $util.ProtocolError("missing required 'timeUse'", { instance: message });
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
                let error = $root.synthpop.TimeUse.verify(message.timeUse);
                if (error)
                    return "timeUse." + error;
            }
            if (message.activityDurations != null && message.hasOwnProperty("activityDurations")) {
                if (!Array.isArray(message.activityDurations))
                    return "activityDurations: array expected";
                for (let i = 0; i < message.activityDurations.length; ++i) {
                    let error = $root.synthpop.ActivityDuration.verify(message.activityDurations[i]);
                    if (error)
                        return "activityDurations." + error;
                }
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
            if (object.timeUse != null) {
                if (typeof object.timeUse !== "object")
                    throw TypeError(".synthpop.Person.timeUse: object expected");
                message.timeUse = $root.synthpop.TimeUse.fromObject(object.timeUse);
            }
            if (object.activityDurations) {
                if (!Array.isArray(object.activityDurations))
                    throw TypeError(".synthpop.Person.activityDurations: array expected");
                message.activityDurations = [];
                for (let i = 0; i < object.activityDurations.length; ++i) {
                    if (typeof object.activityDurations[i] !== "object")
                        throw TypeError(".synthpop.Person.activityDurations: object expected");
                    message.activityDurations[i] = $root.synthpop.ActivityDuration.fromObject(object.activityDurations[i]);
                }
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
            if (options.arrays || options.defaults)
                object.activityDurations = [];
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
                object.timeUse = null;
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
            if (message.timeUse != null && message.hasOwnProperty("timeUse"))
                object.timeUse = $root.synthpop.TimeUse.toObject(message.timeUse, options);
            if (message.activityDurations && message.activityDurations.length) {
                object.activityDurations = [];
                for (let j = 0; j < message.activityDurations.length; ++j)
                    object.activityDurations[j] = $root.synthpop.ActivityDuration.toObject(message.activityDurations[j], options);
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

    synthpop.ActivityDuration = (function() {

        /**
         * Properties of an ActivityDuration.
         * @memberof synthpop
         * @interface IActivityDuration
         * @property {synthpop.Activity} activity ActivityDuration activity
         * @property {number} duration ActivityDuration duration
         */

        /**
         * Constructs a new ActivityDuration.
         * @memberof synthpop
         * @classdesc Represents an ActivityDuration.
         * @implements IActivityDuration
         * @constructor
         * @param {synthpop.IActivityDuration=} [properties] Properties to set
         */
        function ActivityDuration(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ActivityDuration activity.
         * @member {synthpop.Activity} activity
         * @memberof synthpop.ActivityDuration
         * @instance
         */
        ActivityDuration.prototype.activity = 0;

        /**
         * ActivityDuration duration.
         * @member {number} duration
         * @memberof synthpop.ActivityDuration
         * @instance
         */
        ActivityDuration.prototype.duration = 0;

        /**
         * Creates a new ActivityDuration instance using the specified properties.
         * @function create
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {synthpop.IActivityDuration=} [properties] Properties to set
         * @returns {synthpop.ActivityDuration} ActivityDuration instance
         */
        ActivityDuration.create = function create(properties) {
            return new ActivityDuration(properties);
        };

        /**
         * Encodes the specified ActivityDuration message. Does not implicitly {@link synthpop.ActivityDuration.verify|verify} messages.
         * @function encode
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {synthpop.IActivityDuration} message ActivityDuration message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActivityDuration.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.activity);
            writer.uint32(/* id 2, wireType 1 =*/17).double(message.duration);
            return writer;
        };

        /**
         * Encodes the specified ActivityDuration message, length delimited. Does not implicitly {@link synthpop.ActivityDuration.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {synthpop.IActivityDuration} message ActivityDuration message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActivityDuration.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ActivityDuration message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.ActivityDuration} ActivityDuration
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActivityDuration.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.ActivityDuration();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.activity = reader.int32();
                        break;
                    }
                case 2: {
                        message.duration = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("activity"))
                throw $util.ProtocolError("missing required 'activity'", { instance: message });
            if (!message.hasOwnProperty("duration"))
                throw $util.ProtocolError("missing required 'duration'", { instance: message });
            return message;
        };

        /**
         * Decodes an ActivityDuration message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.ActivityDuration} ActivityDuration
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActivityDuration.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ActivityDuration message.
         * @function verify
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ActivityDuration.verify = function verify(message) {
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
            if (typeof message.duration !== "number")
                return "duration: number expected";
            return null;
        };

        /**
         * Creates an ActivityDuration message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.ActivityDuration} ActivityDuration
         */
        ActivityDuration.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.ActivityDuration)
                return object;
            let message = new $root.synthpop.ActivityDuration();
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
            if (object.duration != null)
                message.duration = Number(object.duration);
            return message;
        };

        /**
         * Creates a plain object from an ActivityDuration message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {synthpop.ActivityDuration} message ActivityDuration
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ActivityDuration.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.activity = options.enums === String ? "RETAIL" : 0;
                object.duration = 0;
            }
            if (message.activity != null && message.hasOwnProperty("activity"))
                object.activity = options.enums === String ? $root.synthpop.Activity[message.activity] === undefined ? message.activity : $root.synthpop.Activity[message.activity] : message.activity;
            if (message.duration != null && message.hasOwnProperty("duration"))
                object.duration = options.json && !isFinite(message.duration) ? String(message.duration) : message.duration;
            return object;
        };

        /**
         * Converts this ActivityDuration to JSON.
         * @function toJSON
         * @memberof synthpop.ActivityDuration
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ActivityDuration.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ActivityDuration
         * @function getTypeUrl
         * @memberof synthpop.ActivityDuration
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ActivityDuration.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.ActivityDuration";
        };

        return ActivityDuration;
    })();

    synthpop.Identifiers = (function() {

        /**
         * Properties of an Identifiers.
         * @memberof synthpop
         * @interface IIdentifiers
         * @property {number|Long} pidCensus Identifiers pidCensus
         * @property {number|Long} pidTus Identifiers pidTus
         * @property {number|Long} pidHse Identifiers pidHse
         * @property {string} idp Identifiers idp
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
         * Identifiers pidCensus.
         * @member {number|Long} pidCensus
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.pidCensus = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Identifiers pidTus.
         * @member {number|Long} pidTus
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.pidTus = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Identifiers pidHse.
         * @member {number|Long} pidHse
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.pidHse = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Identifiers idp.
         * @member {string} idp
         * @memberof synthpop.Identifiers
         * @instance
         */
        Identifiers.prototype.idp = "";

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
            writer.uint32(/* id 1, wireType 0 =*/8).int64(message.pidCensus);
            writer.uint32(/* id 2, wireType 0 =*/16).int64(message.pidTus);
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.pidHse);
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.idp);
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
                        message.pidCensus = reader.int64();
                        break;
                    }
                case 2: {
                        message.pidTus = reader.int64();
                        break;
                    }
                case 3: {
                        message.pidHse = reader.int64();
                        break;
                    }
                case 4: {
                        message.idp = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("pidCensus"))
                throw $util.ProtocolError("missing required 'pidCensus'", { instance: message });
            if (!message.hasOwnProperty("pidTus"))
                throw $util.ProtocolError("missing required 'pidTus'", { instance: message });
            if (!message.hasOwnProperty("pidHse"))
                throw $util.ProtocolError("missing required 'pidHse'", { instance: message });
            if (!message.hasOwnProperty("idp"))
                throw $util.ProtocolError("missing required 'idp'", { instance: message });
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
            if (!$util.isInteger(message.pidCensus) && !(message.pidCensus && $util.isInteger(message.pidCensus.low) && $util.isInteger(message.pidCensus.high)))
                return "pidCensus: integer|Long expected";
            if (!$util.isInteger(message.pidTus) && !(message.pidTus && $util.isInteger(message.pidTus.low) && $util.isInteger(message.pidTus.high)))
                return "pidTus: integer|Long expected";
            if (!$util.isInteger(message.pidHse) && !(message.pidHse && $util.isInteger(message.pidHse.low) && $util.isInteger(message.pidHse.high)))
                return "pidHse: integer|Long expected";
            if (!$util.isString(message.idp))
                return "idp: string expected";
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
            if (object.pidCensus != null)
                if ($util.Long)
                    (message.pidCensus = $util.Long.fromValue(object.pidCensus)).unsigned = false;
                else if (typeof object.pidCensus === "string")
                    message.pidCensus = parseInt(object.pidCensus, 10);
                else if (typeof object.pidCensus === "number")
                    message.pidCensus = object.pidCensus;
                else if (typeof object.pidCensus === "object")
                    message.pidCensus = new $util.LongBits(object.pidCensus.low >>> 0, object.pidCensus.high >>> 0).toNumber();
            if (object.pidTus != null)
                if ($util.Long)
                    (message.pidTus = $util.Long.fromValue(object.pidTus)).unsigned = false;
                else if (typeof object.pidTus === "string")
                    message.pidTus = parseInt(object.pidTus, 10);
                else if (typeof object.pidTus === "number")
                    message.pidTus = object.pidTus;
                else if (typeof object.pidTus === "object")
                    message.pidTus = new $util.LongBits(object.pidTus.low >>> 0, object.pidTus.high >>> 0).toNumber();
            if (object.pidHse != null)
                if ($util.Long)
                    (message.pidHse = $util.Long.fromValue(object.pidHse)).unsigned = false;
                else if (typeof object.pidHse === "string")
                    message.pidHse = parseInt(object.pidHse, 10);
                else if (typeof object.pidHse === "number")
                    message.pidHse = object.pidHse;
                else if (typeof object.pidHse === "object")
                    message.pidHse = new $util.LongBits(object.pidHse.low >>> 0, object.pidHse.high >>> 0).toNumber();
            if (object.idp != null)
                message.idp = String(object.idp);
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
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.pidCensus = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.pidCensus = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.pidTus = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.pidTus = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.pidHse = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.pidHse = options.longs === String ? "0" : 0;
                object.idp = "";
            }
            if (message.pidCensus != null && message.hasOwnProperty("pidCensus"))
                if (typeof message.pidCensus === "number")
                    object.pidCensus = options.longs === String ? String(message.pidCensus) : message.pidCensus;
                else
                    object.pidCensus = options.longs === String ? $util.Long.prototype.toString.call(message.pidCensus) : options.longs === Number ? new $util.LongBits(message.pidCensus.low >>> 0, message.pidCensus.high >>> 0).toNumber() : message.pidCensus;
            if (message.pidTus != null && message.hasOwnProperty("pidTus"))
                if (typeof message.pidTus === "number")
                    object.pidTus = options.longs === String ? String(message.pidTus) : message.pidTus;
                else
                    object.pidTus = options.longs === String ? $util.Long.prototype.toString.call(message.pidTus) : options.longs === Number ? new $util.LongBits(message.pidTus.low >>> 0, message.pidTus.high >>> 0).toNumber() : message.pidTus;
            if (message.pidHse != null && message.hasOwnProperty("pidHse"))
                if (typeof message.pidHse === "number")
                    object.pidHse = options.longs === String ? String(message.pidHse) : message.pidHse;
                else
                    object.pidHse = options.longs === String ? $util.Long.prototype.toString.call(message.pidHse) : options.longs === Number ? new $util.LongBits(message.pidHse.low >>> 0, message.pidHse.high >>> 0).toNumber() : message.pidHse;
            if (message.idp != null && message.hasOwnProperty("idp"))
                object.idp = message.idp;
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
         * @property {synthpop.Origin} origin Demographics origin
         * @property {synthpop.NSSEC5} socioeconomicClassification Demographics socioeconomicClassification
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
         * Demographics origin.
         * @member {synthpop.Origin} origin
         * @memberof synthpop.Demographics
         * @instance
         */
        Demographics.prototype.origin = 1;

        /**
         * Demographics socioeconomicClassification.
         * @member {synthpop.NSSEC5} socioeconomicClassification
         * @memberof synthpop.Demographics
         * @instance
         */
        Demographics.prototype.socioeconomicClassification = 0;

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
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.origin);
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.socioeconomicClassification);
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
                        message.origin = reader.int32();
                        break;
                    }
                case 4: {
                        message.socioeconomicClassification = reader.int32();
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
            if (!message.hasOwnProperty("origin"))
                throw $util.ProtocolError("missing required 'origin'", { instance: message });
            if (!message.hasOwnProperty("socioeconomicClassification"))
                throw $util.ProtocolError("missing required 'socioeconomicClassification'", { instance: message });
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
            switch (message.origin) {
            default:
                return "origin: enum value expected";
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            }
            switch (message.socioeconomicClassification) {
            default:
                return "socioeconomicClassification: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
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
            switch (object.origin) {
            default:
                if (typeof object.origin === "number") {
                    message.origin = object.origin;
                    break;
                }
                break;
            case "WHITE":
            case 1:
                message.origin = 1;
                break;
            case "BLACK":
            case 2:
                message.origin = 2;
                break;
            case "ASIAN":
            case 3:
                message.origin = 3;
                break;
            case "MIXED":
            case 4:
                message.origin = 4;
                break;
            case "OTHER":
            case 5:
                message.origin = 5;
                break;
            }
            switch (object.socioeconomicClassification) {
            default:
                if (typeof object.socioeconomicClassification === "number") {
                    message.socioeconomicClassification = object.socioeconomicClassification;
                    break;
                }
                break;
            case "UNEMPLOYED":
            case 0:
                message.socioeconomicClassification = 0;
                break;
            case "HIGHER":
            case 1:
                message.socioeconomicClassification = 1;
                break;
            case "INTERMEDIATE":
            case 2:
                message.socioeconomicClassification = 2;
                break;
            case "SMALL":
            case 3:
                message.socioeconomicClassification = 3;
                break;
            case "LOWER":
            case 4:
                message.socioeconomicClassification = 4;
                break;
            case "ROUTINE":
            case 5:
                message.socioeconomicClassification = 5;
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
                object.origin = options.enums === String ? "WHITE" : 1;
                object.socioeconomicClassification = options.enums === String ? "UNEMPLOYED" : 0;
            }
            if (message.sex != null && message.hasOwnProperty("sex"))
                object.sex = options.enums === String ? $root.synthpop.Sex[message.sex] === undefined ? message.sex : $root.synthpop.Sex[message.sex] : message.sex;
            if (message.ageYears != null && message.hasOwnProperty("ageYears"))
                object.ageYears = message.ageYears;
            if (message.origin != null && message.hasOwnProperty("origin"))
                object.origin = options.enums === String ? $root.synthpop.Origin[message.origin] === undefined ? message.origin : $root.synthpop.Origin[message.origin] : message.origin;
            if (message.socioeconomicClassification != null && message.hasOwnProperty("socioeconomicClassification"))
                object.socioeconomicClassification = options.enums === String ? $root.synthpop.NSSEC5[message.socioeconomicClassification] === undefined ? message.socioeconomicClassification : $root.synthpop.NSSEC5[message.socioeconomicClassification] : message.socioeconomicClassification;
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
         * @property {number|Long|null} [sic1d07] Employment sic1d07
         * @property {number|Long|null} [sic2d07] Employment sic2d07
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
         * Employment sic1d07.
         * @member {number|Long} sic1d07
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.sic1d07 = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Employment sic2d07.
         * @member {number|Long} sic2d07
         * @memberof synthpop.Employment
         * @instance
         */
        Employment.prototype.sic2d07 = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

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
            if (message.sic1d07 != null && Object.hasOwnProperty.call(message, "sic1d07"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.sic1d07);
            if (message.sic2d07 != null && Object.hasOwnProperty.call(message, "sic2d07"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.sic2d07);
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
                        message.sic1d07 = reader.uint64();
                        break;
                    }
                case 2: {
                        message.sic2d07 = reader.uint64();
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
            if (message.sic1d07 != null && message.hasOwnProperty("sic1d07"))
                if (!$util.isInteger(message.sic1d07) && !(message.sic1d07 && $util.isInteger(message.sic1d07.low) && $util.isInteger(message.sic1d07.high)))
                    return "sic1d07: integer|Long expected";
            if (message.sic2d07 != null && message.hasOwnProperty("sic2d07"))
                if (!$util.isInteger(message.sic2d07) && !(message.sic2d07 && $util.isInteger(message.sic2d07.low) && $util.isInteger(message.sic2d07.high)))
                    return "sic2d07: integer|Long expected";
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
            if (object.sic1d07 != null)
                if ($util.Long)
                    (message.sic1d07 = $util.Long.fromValue(object.sic1d07)).unsigned = true;
                else if (typeof object.sic1d07 === "string")
                    message.sic1d07 = parseInt(object.sic1d07, 10);
                else if (typeof object.sic1d07 === "number")
                    message.sic1d07 = object.sic1d07;
                else if (typeof object.sic1d07 === "object")
                    message.sic1d07 = new $util.LongBits(object.sic1d07.low >>> 0, object.sic1d07.high >>> 0).toNumber(true);
            if (object.sic2d07 != null)
                if ($util.Long)
                    (message.sic2d07 = $util.Long.fromValue(object.sic2d07)).unsigned = true;
                else if (typeof object.sic2d07 === "string")
                    message.sic2d07 = parseInt(object.sic2d07, 10);
                else if (typeof object.sic2d07 === "number")
                    message.sic2d07 = object.sic2d07;
                else if (typeof object.sic2d07 === "object")
                    message.sic2d07 = new $util.LongBits(object.sic2d07.low >>> 0, object.sic2d07.high >>> 0).toNumber(true);
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
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.sic1d07 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sic1d07 = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.sic2d07 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sic2d07 = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.soc2010 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.soc2010 = options.longs === String ? "0" : 0;
                object.pwkstat = options.enums === String ? "NA" : 0;
                object.salaryYearly = 0;
                object.salaryHourly = 0;
            }
            if (message.sic1d07 != null && message.hasOwnProperty("sic1d07"))
                if (typeof message.sic1d07 === "number")
                    object.sic1d07 = options.longs === String ? String(message.sic1d07) : message.sic1d07;
                else
                    object.sic1d07 = options.longs === String ? $util.Long.prototype.toString.call(message.sic1d07) : options.longs === Number ? new $util.LongBits(message.sic1d07.low >>> 0, message.sic1d07.high >>> 0).toNumber(true) : message.sic1d07;
            if (message.sic2d07 != null && message.hasOwnProperty("sic2d07"))
                if (typeof message.sic2d07 === "number")
                    object.sic2d07 = options.longs === String ? String(message.sic2d07) : message.sic2d07;
                else
                    object.sic2d07 = options.longs === String ? $util.Long.prototype.toString.call(message.sic2d07) : options.longs === Number ? new $util.LongBits(message.sic2d07.low >>> 0, message.sic2d07.high >>> 0).toNumber(true) : message.sic2d07;
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
     * Origin enum.
     * @name synthpop.Origin
     * @enum {number}
     * @property {number} WHITE=1 WHITE value
     * @property {number} BLACK=2 BLACK value
     * @property {number} ASIAN=3 ASIAN value
     * @property {number} MIXED=4 MIXED value
     * @property {number} OTHER=5 OTHER value
     */
    synthpop.Origin = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "WHITE"] = 1;
        values[valuesById[2] = "BLACK"] = 2;
        values[valuesById[3] = "ASIAN"] = 3;
        values[valuesById[4] = "MIXED"] = 4;
        values[valuesById[5] = "OTHER"] = 5;
        return values;
    })();

    /**
     * NSSEC5 enum.
     * @name synthpop.NSSEC5
     * @enum {number}
     * @property {number} UNEMPLOYED=0 UNEMPLOYED value
     * @property {number} HIGHER=1 HIGHER value
     * @property {number} INTERMEDIATE=2 INTERMEDIATE value
     * @property {number} SMALL=3 SMALL value
     * @property {number} LOWER=4 LOWER value
     * @property {number} ROUTINE=5 ROUTINE value
     */
    synthpop.NSSEC5 = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "UNEMPLOYED"] = 0;
        values[valuesById[1] = "HIGHER"] = 1;
        values[valuesById[2] = "INTERMEDIATE"] = 2;
        values[valuesById[3] = "SMALL"] = 3;
        values[valuesById[4] = "LOWER"] = 4;
        values[valuesById[5] = "ROUTINE"] = 5;
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
         * @property {synthpop.BMI} bmi Health bmi
         * @property {number|null} [bmiNew] Health bmiNew
         * @property {boolean} hasCardiovascularDisease Health hasCardiovascularDisease
         * @property {boolean} hasDiabetes Health hasDiabetes
         * @property {boolean} hasHighBloodPressure Health hasHighBloodPressure
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
         * @member {synthpop.BMI} bmi
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.bmi = 0;

        /**
         * Health bmiNew.
         * @member {number} bmiNew
         * @memberof synthpop.Health
         * @instance
         */
        Health.prototype.bmiNew = 0;

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
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.bmi);
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.hasCardiovascularDisease);
            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.hasDiabetes);
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.hasHighBloodPressure);
            if (message.bmiNew != null && Object.hasOwnProperty.call(message, "bmiNew"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.bmiNew);
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
                        message.bmi = reader.int32();
                        break;
                    }
                case 5: {
                        message.bmiNew = reader.float();
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
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("bmi"))
                throw $util.ProtocolError("missing required 'bmi'", { instance: message });
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
            switch (message.bmi) {
            default:
                return "bmi: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                break;
            }
            if (message.bmiNew != null && message.hasOwnProperty("bmiNew"))
                if (typeof message.bmiNew !== "number")
                    return "bmiNew: number expected";
            if (typeof message.hasCardiovascularDisease !== "boolean")
                return "hasCardiovascularDisease: boolean expected";
            if (typeof message.hasDiabetes !== "boolean")
                return "hasDiabetes: boolean expected";
            if (typeof message.hasHighBloodPressure !== "boolean")
                return "hasHighBloodPressure: boolean expected";
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
            switch (object.bmi) {
            default:
                if (typeof object.bmi === "number") {
                    message.bmi = object.bmi;
                    break;
                }
                break;
            case "NOT_APPLICABLE":
            case 0:
                message.bmi = 0;
                break;
            case "UNDERWEIGHT":
            case 1:
                message.bmi = 1;
                break;
            case "NORMAL":
            case 2:
                message.bmi = 2;
                break;
            case "OVERWEIGHT":
            case 3:
                message.bmi = 3;
                break;
            case "OBESE_1":
            case 4:
                message.bmi = 4;
                break;
            case "OBESE_2":
            case 5:
                message.bmi = 5;
                break;
            case "OBESE_3":
            case 6:
                message.bmi = 6;
                break;
            }
            if (object.bmiNew != null)
                message.bmiNew = Number(object.bmiNew);
            if (object.hasCardiovascularDisease != null)
                message.hasCardiovascularDisease = Boolean(object.hasCardiovascularDisease);
            if (object.hasDiabetes != null)
                message.hasDiabetes = Boolean(object.hasDiabetes);
            if (object.hasHighBloodPressure != null)
                message.hasHighBloodPressure = Boolean(object.hasHighBloodPressure);
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
                object.bmi = options.enums === String ? "NOT_APPLICABLE" : 0;
                object.hasCardiovascularDisease = false;
                object.hasDiabetes = false;
                object.hasHighBloodPressure = false;
                object.bmiNew = 0;
            }
            if (message.bmi != null && message.hasOwnProperty("bmi"))
                object.bmi = options.enums === String ? $root.synthpop.BMI[message.bmi] === undefined ? message.bmi : $root.synthpop.BMI[message.bmi] : message.bmi;
            if (message.hasCardiovascularDisease != null && message.hasOwnProperty("hasCardiovascularDisease"))
                object.hasCardiovascularDisease = message.hasCardiovascularDisease;
            if (message.hasDiabetes != null && message.hasOwnProperty("hasDiabetes"))
                object.hasDiabetes = message.hasDiabetes;
            if (message.hasHighBloodPressure != null && message.hasOwnProperty("hasHighBloodPressure"))
                object.hasHighBloodPressure = message.hasHighBloodPressure;
            if (message.bmiNew != null && message.hasOwnProperty("bmiNew"))
                object.bmiNew = options.json && !isFinite(message.bmiNew) ? String(message.bmiNew) : message.bmiNew;
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
     * BMI enum.
     * @name synthpop.BMI
     * @enum {number}
     * @property {number} NOT_APPLICABLE=0 NOT_APPLICABLE value
     * @property {number} UNDERWEIGHT=1 UNDERWEIGHT value
     * @property {number} NORMAL=2 NORMAL value
     * @property {number} OVERWEIGHT=3 OVERWEIGHT value
     * @property {number} OBESE_1=4 OBESE_1 value
     * @property {number} OBESE_2=5 OBESE_2 value
     * @property {number} OBESE_3=6 OBESE_3 value
     */
    synthpop.BMI = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "NOT_APPLICABLE"] = 0;
        values[valuesById[1] = "UNDERWEIGHT"] = 1;
        values[valuesById[2] = "NORMAL"] = 2;
        values[valuesById[3] = "OVERWEIGHT"] = 3;
        values[valuesById[4] = "OBESE_1"] = 4;
        values[valuesById[5] = "OBESE_2"] = 5;
        values[valuesById[6] = "OBESE_3"] = 6;
        return values;
    })();

    synthpop.TimeUse = (function() {

        /**
         * Properties of a TimeUse.
         * @memberof synthpop
         * @interface ITimeUse
         * @property {number} unknown TimeUse unknown
         * @property {number} work TimeUse work
         * @property {number} school TimeUse school
         * @property {number} shop TimeUse shop
         * @property {number} services TimeUse services
         * @property {number} leisure TimeUse leisure
         * @property {number} escort TimeUse escort
         * @property {number} transport TimeUse transport
         * @property {number} notHome TimeUse notHome
         * @property {number} home TimeUse home
         * @property {number} workHome TimeUse workHome
         * @property {number} homeTotal TimeUse homeTotal
         */

        /**
         * Constructs a new TimeUse.
         * @memberof synthpop
         * @classdesc Represents a TimeUse.
         * @implements ITimeUse
         * @constructor
         * @param {synthpop.ITimeUse=} [properties] Properties to set
         */
        function TimeUse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TimeUse unknown.
         * @member {number} unknown
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.unknown = 0;

        /**
         * TimeUse work.
         * @member {number} work
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.work = 0;

        /**
         * TimeUse school.
         * @member {number} school
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.school = 0;

        /**
         * TimeUse shop.
         * @member {number} shop
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.shop = 0;

        /**
         * TimeUse services.
         * @member {number} services
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.services = 0;

        /**
         * TimeUse leisure.
         * @member {number} leisure
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.leisure = 0;

        /**
         * TimeUse escort.
         * @member {number} escort
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.escort = 0;

        /**
         * TimeUse transport.
         * @member {number} transport
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.transport = 0;

        /**
         * TimeUse notHome.
         * @member {number} notHome
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.notHome = 0;

        /**
         * TimeUse home.
         * @member {number} home
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.home = 0;

        /**
         * TimeUse workHome.
         * @member {number} workHome
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.workHome = 0;

        /**
         * TimeUse homeTotal.
         * @member {number} homeTotal
         * @memberof synthpop.TimeUse
         * @instance
         */
        TimeUse.prototype.homeTotal = 0;

        /**
         * Creates a new TimeUse instance using the specified properties.
         * @function create
         * @memberof synthpop.TimeUse
         * @static
         * @param {synthpop.ITimeUse=} [properties] Properties to set
         * @returns {synthpop.TimeUse} TimeUse instance
         */
        TimeUse.create = function create(properties) {
            return new TimeUse(properties);
        };

        /**
         * Encodes the specified TimeUse message. Does not implicitly {@link synthpop.TimeUse.verify|verify} messages.
         * @function encode
         * @memberof synthpop.TimeUse
         * @static
         * @param {synthpop.ITimeUse} message TimeUse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TimeUse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 1 =*/9).double(message.unknown);
            writer.uint32(/* id 2, wireType 1 =*/17).double(message.work);
            writer.uint32(/* id 3, wireType 1 =*/25).double(message.school);
            writer.uint32(/* id 4, wireType 1 =*/33).double(message.shop);
            writer.uint32(/* id 5, wireType 1 =*/41).double(message.services);
            writer.uint32(/* id 6, wireType 1 =*/49).double(message.leisure);
            writer.uint32(/* id 7, wireType 1 =*/57).double(message.escort);
            writer.uint32(/* id 8, wireType 1 =*/65).double(message.transport);
            writer.uint32(/* id 9, wireType 1 =*/73).double(message.notHome);
            writer.uint32(/* id 10, wireType 1 =*/81).double(message.home);
            writer.uint32(/* id 11, wireType 1 =*/89).double(message.workHome);
            writer.uint32(/* id 12, wireType 1 =*/97).double(message.homeTotal);
            return writer;
        };

        /**
         * Encodes the specified TimeUse message, length delimited. Does not implicitly {@link synthpop.TimeUse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof synthpop.TimeUse
         * @static
         * @param {synthpop.ITimeUse} message TimeUse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TimeUse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TimeUse message from the specified reader or buffer.
         * @function decode
         * @memberof synthpop.TimeUse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {synthpop.TimeUse} TimeUse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TimeUse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.synthpop.TimeUse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.unknown = reader.double();
                        break;
                    }
                case 2: {
                        message.work = reader.double();
                        break;
                    }
                case 3: {
                        message.school = reader.double();
                        break;
                    }
                case 4: {
                        message.shop = reader.double();
                        break;
                    }
                case 5: {
                        message.services = reader.double();
                        break;
                    }
                case 6: {
                        message.leisure = reader.double();
                        break;
                    }
                case 7: {
                        message.escort = reader.double();
                        break;
                    }
                case 8: {
                        message.transport = reader.double();
                        break;
                    }
                case 9: {
                        message.notHome = reader.double();
                        break;
                    }
                case 10: {
                        message.home = reader.double();
                        break;
                    }
                case 11: {
                        message.workHome = reader.double();
                        break;
                    }
                case 12: {
                        message.homeTotal = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("unknown"))
                throw $util.ProtocolError("missing required 'unknown'", { instance: message });
            if (!message.hasOwnProperty("work"))
                throw $util.ProtocolError("missing required 'work'", { instance: message });
            if (!message.hasOwnProperty("school"))
                throw $util.ProtocolError("missing required 'school'", { instance: message });
            if (!message.hasOwnProperty("shop"))
                throw $util.ProtocolError("missing required 'shop'", { instance: message });
            if (!message.hasOwnProperty("services"))
                throw $util.ProtocolError("missing required 'services'", { instance: message });
            if (!message.hasOwnProperty("leisure"))
                throw $util.ProtocolError("missing required 'leisure'", { instance: message });
            if (!message.hasOwnProperty("escort"))
                throw $util.ProtocolError("missing required 'escort'", { instance: message });
            if (!message.hasOwnProperty("transport"))
                throw $util.ProtocolError("missing required 'transport'", { instance: message });
            if (!message.hasOwnProperty("notHome"))
                throw $util.ProtocolError("missing required 'notHome'", { instance: message });
            if (!message.hasOwnProperty("home"))
                throw $util.ProtocolError("missing required 'home'", { instance: message });
            if (!message.hasOwnProperty("workHome"))
                throw $util.ProtocolError("missing required 'workHome'", { instance: message });
            if (!message.hasOwnProperty("homeTotal"))
                throw $util.ProtocolError("missing required 'homeTotal'", { instance: message });
            return message;
        };

        /**
         * Decodes a TimeUse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof synthpop.TimeUse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {synthpop.TimeUse} TimeUse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TimeUse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TimeUse message.
         * @function verify
         * @memberof synthpop.TimeUse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TimeUse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (typeof message.unknown !== "number")
                return "unknown: number expected";
            if (typeof message.work !== "number")
                return "work: number expected";
            if (typeof message.school !== "number")
                return "school: number expected";
            if (typeof message.shop !== "number")
                return "shop: number expected";
            if (typeof message.services !== "number")
                return "services: number expected";
            if (typeof message.leisure !== "number")
                return "leisure: number expected";
            if (typeof message.escort !== "number")
                return "escort: number expected";
            if (typeof message.transport !== "number")
                return "transport: number expected";
            if (typeof message.notHome !== "number")
                return "notHome: number expected";
            if (typeof message.home !== "number")
                return "home: number expected";
            if (typeof message.workHome !== "number")
                return "workHome: number expected";
            if (typeof message.homeTotal !== "number")
                return "homeTotal: number expected";
            return null;
        };

        /**
         * Creates a TimeUse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof synthpop.TimeUse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {synthpop.TimeUse} TimeUse
         */
        TimeUse.fromObject = function fromObject(object) {
            if (object instanceof $root.synthpop.TimeUse)
                return object;
            let message = new $root.synthpop.TimeUse();
            if (object.unknown != null)
                message.unknown = Number(object.unknown);
            if (object.work != null)
                message.work = Number(object.work);
            if (object.school != null)
                message.school = Number(object.school);
            if (object.shop != null)
                message.shop = Number(object.shop);
            if (object.services != null)
                message.services = Number(object.services);
            if (object.leisure != null)
                message.leisure = Number(object.leisure);
            if (object.escort != null)
                message.escort = Number(object.escort);
            if (object.transport != null)
                message.transport = Number(object.transport);
            if (object.notHome != null)
                message.notHome = Number(object.notHome);
            if (object.home != null)
                message.home = Number(object.home);
            if (object.workHome != null)
                message.workHome = Number(object.workHome);
            if (object.homeTotal != null)
                message.homeTotal = Number(object.homeTotal);
            return message;
        };

        /**
         * Creates a plain object from a TimeUse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof synthpop.TimeUse
         * @static
         * @param {synthpop.TimeUse} message TimeUse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TimeUse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.unknown = 0;
                object.work = 0;
                object.school = 0;
                object.shop = 0;
                object.services = 0;
                object.leisure = 0;
                object.escort = 0;
                object.transport = 0;
                object.notHome = 0;
                object.home = 0;
                object.workHome = 0;
                object.homeTotal = 0;
            }
            if (message.unknown != null && message.hasOwnProperty("unknown"))
                object.unknown = options.json && !isFinite(message.unknown) ? String(message.unknown) : message.unknown;
            if (message.work != null && message.hasOwnProperty("work"))
                object.work = options.json && !isFinite(message.work) ? String(message.work) : message.work;
            if (message.school != null && message.hasOwnProperty("school"))
                object.school = options.json && !isFinite(message.school) ? String(message.school) : message.school;
            if (message.shop != null && message.hasOwnProperty("shop"))
                object.shop = options.json && !isFinite(message.shop) ? String(message.shop) : message.shop;
            if (message.services != null && message.hasOwnProperty("services"))
                object.services = options.json && !isFinite(message.services) ? String(message.services) : message.services;
            if (message.leisure != null && message.hasOwnProperty("leisure"))
                object.leisure = options.json && !isFinite(message.leisure) ? String(message.leisure) : message.leisure;
            if (message.escort != null && message.hasOwnProperty("escort"))
                object.escort = options.json && !isFinite(message.escort) ? String(message.escort) : message.escort;
            if (message.transport != null && message.hasOwnProperty("transport"))
                object.transport = options.json && !isFinite(message.transport) ? String(message.transport) : message.transport;
            if (message.notHome != null && message.hasOwnProperty("notHome"))
                object.notHome = options.json && !isFinite(message.notHome) ? String(message.notHome) : message.notHome;
            if (message.home != null && message.hasOwnProperty("home"))
                object.home = options.json && !isFinite(message.home) ? String(message.home) : message.home;
            if (message.workHome != null && message.hasOwnProperty("workHome"))
                object.workHome = options.json && !isFinite(message.workHome) ? String(message.workHome) : message.workHome;
            if (message.homeTotal != null && message.hasOwnProperty("homeTotal"))
                object.homeTotal = options.json && !isFinite(message.homeTotal) ? String(message.homeTotal) : message.homeTotal;
            return object;
        };

        /**
         * Converts this TimeUse to JSON.
         * @function toJSON
         * @memberof synthpop.TimeUse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TimeUse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TimeUse
         * @function getTypeUrl
         * @memberof synthpop.TimeUse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TimeUse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/synthpop.TimeUse";
        };

        return TimeUse;
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
         * @property {number|Long|null} [urn] Venue urn
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
         * @member {number|Long} urn
         * @memberof synthpop.Venue
         * @instance
         */
        Venue.prototype.urn = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

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
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.urn);
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
                        message.urn = reader.uint64();
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
                if (!$util.isInteger(message.urn) && !(message.urn && $util.isInteger(message.urn.low) && $util.isInteger(message.urn.high)))
                    return "urn: integer|Long expected";
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
                if ($util.Long)
                    (message.urn = $util.Long.fromValue(object.urn)).unsigned = true;
                else if (typeof object.urn === "string")
                    message.urn = parseInt(object.urn, 10);
                else if (typeof object.urn === "number")
                    message.urn = object.urn;
                else if (typeof object.urn === "object")
                    message.urn = new $util.LongBits(object.urn.low >>> 0, object.urn.high >>> 0).toNumber(true);
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
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.urn = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.urn = options.longs === String ? "0" : 0;
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
                if (typeof message.urn === "number")
                    object.urn = options.longs === String ? String(message.urn) : message.urn;
                else
                    object.urn = options.longs === String ? $util.Long.prototype.toString.call(message.urn) : options.longs === Number ? new $util.LongBits(message.urn.low >>> 0, message.urn.high >>> 0).toNumber(true) : message.urn;
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
         * @property {Array.<number>|null} [perDay] Lockdown perDay
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
            this.perDay = [];
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
         * Lockdown perDay.
         * @member {Array.<number>} perDay
         * @memberof synthpop.Lockdown
         * @instance
         */
        Lockdown.prototype.perDay = $util.emptyArray;

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
            if (message.perDay != null && message.perDay.length)
                for (let i = 0; i < message.perDay.length; ++i)
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.perDay[i]);
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
                        if (!(message.perDay && message.perDay.length))
                            message.perDay = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.perDay.push(reader.float());
                        } else
                            message.perDay.push(reader.float());
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
            if (message.perDay != null && message.hasOwnProperty("perDay")) {
                if (!Array.isArray(message.perDay))
                    return "perDay: array expected";
                for (let i = 0; i < message.perDay.length; ++i)
                    if (typeof message.perDay[i] !== "number")
                        return "perDay: number[] expected";
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
            if (object.perDay) {
                if (!Array.isArray(object.perDay))
                    throw TypeError(".synthpop.Lockdown.perDay: array expected");
                message.perDay = [];
                for (let i = 0; i < object.perDay.length; ++i)
                    message.perDay[i] = Number(object.perDay[i]);
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
                object.perDay = [];
            if (options.defaults)
                object.startDate = "";
            if (message.startDate != null && message.hasOwnProperty("startDate"))
                object.startDate = message.startDate;
            if (message.perDay && message.perDay.length) {
                object.perDay = [];
                for (let j = 0; j < message.perDay.length; ++j)
                    object.perDay[j] = options.json && !isFinite(message.perDay[j]) ? String(message.perDay[j]) : message.perDay[j];
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

    return synthpop;
})();

export { $root as default };
