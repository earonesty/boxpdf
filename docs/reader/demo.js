var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/common.js
var require_common = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/common.js"(exports) {
    "use strict";
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has2(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    exports.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has2(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i2 = 0; i2 < len; i2++) {
          dest[dest_offs + i2] = src[src_offs + i2];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        var i2, l, len, pos, chunk, result;
        len = 0;
        for (i2 = 0, l = chunks.length; i2 < l; i2++) {
          len += chunks[i2].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i2 = 0, l = chunks.length; i2 < l; i2++) {
          chunk = chunks[i2];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }
    };
    var fnUntyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        for (var i2 = 0; i2 < len; i2++) {
          dest[dest_offs + i2] = src[src_offs + i2];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        return [].concat.apply([], chunks);
      }
    };
    exports.setTyped = function(on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };
    exports.setTyped(TYPED_OK);
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/trees.js
var require_trees = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/trees.js"(exports) {
    "use strict";
    var utils = require_common();
    var Z_FIXED2 = 4;
    var Z_BINARY2 = 0;
    var Z_TEXT2 = 1;
    var Z_UNKNOWN2 = 2;
    function zero2(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    var STORED_BLOCK2 = 0;
    var STATIC_TREES2 = 1;
    var DYN_TREES2 = 2;
    var MIN_MATCH2 = 3;
    var MAX_MATCH2 = 258;
    var LENGTH_CODES2 = 29;
    var LITERALS2 = 256;
    var L_CODES2 = LITERALS2 + 1 + LENGTH_CODES2;
    var D_CODES2 = 30;
    var BL_CODES2 = 19;
    var HEAP_SIZE2 = 2 * L_CODES2 + 1;
    var MAX_BITS2 = 15;
    var Buf_size2 = 16;
    var MAX_BL_BITS2 = 7;
    var END_BLOCK2 = 256;
    var REP_3_62 = 16;
    var REPZ_3_102 = 17;
    var REPZ_11_1382 = 18;
    var extra_lbits2 = (
      /* extra bits for each length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
    );
    var extra_dbits2 = (
      /* extra bits for each distance code */
      [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
    );
    var extra_blbits2 = (
      /* extra bits for each bit length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
    );
    var bl_order2 = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var DIST_CODE_LEN2 = 512;
    var static_ltree2 = new Array((L_CODES2 + 2) * 2);
    zero2(static_ltree2);
    var static_dtree2 = new Array(D_CODES2 * 2);
    zero2(static_dtree2);
    var _dist_code2 = new Array(DIST_CODE_LEN2);
    zero2(_dist_code2);
    var _length_code2 = new Array(MAX_MATCH2 - MIN_MATCH2 + 1);
    zero2(_length_code2);
    var base_length2 = new Array(LENGTH_CODES2);
    zero2(base_length2);
    var base_dist2 = new Array(D_CODES2);
    zero2(base_dist2);
    function StaticTreeDesc2(static_tree, extra_bits, extra_base, elems, max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
      this.has_stree = static_tree && static_tree.length;
    }
    var static_l_desc2;
    var static_d_desc2;
    var static_bl_desc2;
    function TreeDesc2(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      this.max_code = 0;
      this.stat_desc = stat_desc;
    }
    function d_code2(dist) {
      return dist < 256 ? _dist_code2[dist] : _dist_code2[256 + (dist >>> 7)];
    }
    function put_short2(s, w) {
      s.pending_buf[s.pending++] = w & 255;
      s.pending_buf[s.pending++] = w >>> 8 & 255;
    }
    function send_bits2(s, value, length) {
      if (s.bi_valid > Buf_size2 - length) {
        s.bi_buf |= value << s.bi_valid & 65535;
        put_short2(s, s.bi_buf);
        s.bi_buf = value >> Buf_size2 - s.bi_valid;
        s.bi_valid += length - Buf_size2;
      } else {
        s.bi_buf |= value << s.bi_valid & 65535;
        s.bi_valid += length;
      }
    }
    function send_code2(s, c, tree) {
      send_bits2(
        s,
        tree[c * 2],
        tree[c * 2 + 1]
        /*.Len*/
      );
    }
    function bi_reverse2(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }
    function bi_flush2(s) {
      if (s.bi_valid === 16) {
        put_short2(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;
      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 255;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    }
    function gen_bitlen2(s, desc) {
      var tree = desc.dyn_tree;
      var max_code = desc.max_code;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var extra = desc.stat_desc.extra_bits;
      var base = desc.stat_desc.extra_base;
      var max_length = desc.stat_desc.max_length;
      var h;
      var n, m;
      var bits;
      var xbits;
      var f;
      var overflow = 0;
      for (bits = 0; bits <= MAX_BITS2; bits++) {
        s.bl_count[bits] = 0;
      }
      tree[s.heap[s.heap_max] * 2 + 1] = 0;
      for (h = s.heap_max + 1; h < HEAP_SIZE2; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = bits;
        if (n > max_code) {
          continue;
        }
        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1] + xbits);
        }
      }
      if (overflow === 0) {
        return;
      }
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) {
          bits--;
        }
        s.bl_count[bits]--;
        s.bl_count[bits + 1] += 2;
        s.bl_count[max_length]--;
        overflow -= 2;
      } while (overflow > 0);
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1] !== bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = bits;
          }
          n--;
        }
      }
    }
    function gen_codes2(tree, max_code, bl_count) {
      var next_code = new Array(MAX_BITS2 + 1);
      var code = 0;
      var bits;
      var n;
      for (bits = 1; bits <= MAX_BITS2; bits++) {
        next_code[bits] = code = code + bl_count[bits - 1] << 1;
      }
      for (n = 0; n <= max_code; n++) {
        var len = tree[n * 2 + 1];
        if (len === 0) {
          continue;
        }
        tree[n * 2] = bi_reverse2(next_code[len]++, len);
      }
    }
    function tr_static_init2() {
      var n;
      var bits;
      var length;
      var code;
      var dist;
      var bl_count = new Array(MAX_BITS2 + 1);
      length = 0;
      for (code = 0; code < LENGTH_CODES2 - 1; code++) {
        base_length2[code] = length;
        for (n = 0; n < 1 << extra_lbits2[code]; n++) {
          _length_code2[length++] = code;
        }
      }
      _length_code2[length - 1] = code;
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist2[code] = dist;
        for (n = 0; n < 1 << extra_dbits2[code]; n++) {
          _dist_code2[dist++] = code;
        }
      }
      dist >>= 7;
      for (; code < D_CODES2; code++) {
        base_dist2[code] = dist << 7;
        for (n = 0; n < 1 << extra_dbits2[code] - 7; n++) {
          _dist_code2[256 + dist++] = code;
        }
      }
      for (bits = 0; bits <= MAX_BITS2; bits++) {
        bl_count[bits] = 0;
      }
      n = 0;
      while (n <= 143) {
        static_ltree2[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree2[n * 2 + 1] = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree2[n * 2 + 1] = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree2[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      gen_codes2(static_ltree2, L_CODES2 + 1, bl_count);
      for (n = 0; n < D_CODES2; n++) {
        static_dtree2[n * 2 + 1] = 5;
        static_dtree2[n * 2] = bi_reverse2(n, 5);
      }
      static_l_desc2 = new StaticTreeDesc2(static_ltree2, extra_lbits2, LITERALS2 + 1, L_CODES2, MAX_BITS2);
      static_d_desc2 = new StaticTreeDesc2(static_dtree2, extra_dbits2, 0, D_CODES2, MAX_BITS2);
      static_bl_desc2 = new StaticTreeDesc2(new Array(0), extra_blbits2, 0, BL_CODES2, MAX_BL_BITS2);
    }
    function init_block2(s) {
      var n;
      for (n = 0; n < L_CODES2; n++) {
        s.dyn_ltree[n * 2] = 0;
      }
      for (n = 0; n < D_CODES2; n++) {
        s.dyn_dtree[n * 2] = 0;
      }
      for (n = 0; n < BL_CODES2; n++) {
        s.bl_tree[n * 2] = 0;
      }
      s.dyn_ltree[END_BLOCK2 * 2] = 1;
      s.opt_len = s.static_len = 0;
      s.last_lit = s.matches = 0;
    }
    function bi_windup2(s) {
      if (s.bi_valid > 8) {
        put_short2(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    }
    function copy_block(s, buf, len, header) {
      bi_windup2(s);
      if (header) {
        put_short2(s, len);
        put_short2(s, ~len);
      }
      utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
      s.pending += len;
    }
    function smaller2(tree, n, m, depth) {
      var _n2 = n * 2;
      var _m2 = m * 2;
      return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
    }
    function pqdownheap2(s, tree, k) {
      var v = s.heap[k];
      var j = k << 1;
      while (j <= s.heap_len) {
        if (j < s.heap_len && smaller2(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
        }
        if (smaller2(tree, v, s.heap[j], s.depth)) {
          break;
        }
        s.heap[k] = s.heap[j];
        k = j;
        j <<= 1;
      }
      s.heap[k] = v;
    }
    function compress_block2(s, ltree, dtree) {
      var dist;
      var lc;
      var lx = 0;
      var code;
      var extra;
      if (s.last_lit !== 0) {
        do {
          dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
          lc = s.pending_buf[s.l_buf + lx];
          lx++;
          if (dist === 0) {
            send_code2(s, lc, ltree);
          } else {
            code = _length_code2[lc];
            send_code2(s, code + LITERALS2 + 1, ltree);
            extra = extra_lbits2[code];
            if (extra !== 0) {
              lc -= base_length2[code];
              send_bits2(s, lc, extra);
            }
            dist--;
            code = d_code2(dist);
            send_code2(s, code, dtree);
            extra = extra_dbits2[code];
            if (extra !== 0) {
              dist -= base_dist2[code];
              send_bits2(s, dist, extra);
            }
          }
        } while (lx < s.last_lit);
      }
      send_code2(s, END_BLOCK2, ltree);
    }
    function build_tree2(s, desc) {
      var tree = desc.dyn_tree;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var elems = desc.stat_desc.elems;
      var n, m;
      var max_code = -1;
      var node;
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE2;
      for (n = 0; n < elems; n++) {
        if (tree[n * 2] !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (has_stree) {
          s.static_len -= stree[node * 2 + 1];
        }
      }
      desc.max_code = max_code;
      for (n = s.heap_len >> 1; n >= 1; n--) {
        pqdownheap2(s, tree, n);
      }
      node = elems;
      do {
        n = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[
          1
          /*SMALLEST*/
        ] = s.heap[s.heap_len--];
        pqdownheap2(
          s,
          tree,
          1
          /*SMALLEST*/
        );
        m = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[--s.heap_max] = n;
        s.heap[--s.heap_max] = m;
        tree[node * 2] = tree[n * 2] + tree[m * 2];
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1] = tree[m * 2 + 1] = node;
        s.heap[
          1
          /*SMALLEST*/
        ] = node++;
        pqdownheap2(
          s,
          tree,
          1
          /*SMALLEST*/
        );
      } while (s.heap_len >= 2);
      s.heap[--s.heap_max] = s.heap[
        1
        /*SMALLEST*/
      ];
      gen_bitlen2(s, desc);
      gen_codes2(tree, max_code, s.bl_count);
    }
    function scan_tree2(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1] = 65535;
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          s.bl_tree[curlen * 2] += count;
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            s.bl_tree[curlen * 2]++;
          }
          s.bl_tree[REP_3_62 * 2]++;
        } else if (count <= 10) {
          s.bl_tree[REPZ_3_102 * 2]++;
        } else {
          s.bl_tree[REPZ_11_1382 * 2]++;
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function send_tree2(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          do {
            send_code2(s, curlen, s.bl_tree);
          } while (--count !== 0);
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code2(s, curlen, s.bl_tree);
            count--;
          }
          send_code2(s, REP_3_62, s.bl_tree);
          send_bits2(s, count - 3, 2);
        } else if (count <= 10) {
          send_code2(s, REPZ_3_102, s.bl_tree);
          send_bits2(s, count - 3, 3);
        } else {
          send_code2(s, REPZ_11_1382, s.bl_tree);
          send_bits2(s, count - 11, 7);
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function build_bl_tree2(s) {
      var max_blindex;
      scan_tree2(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree2(s, s.dyn_dtree, s.d_desc.max_code);
      build_tree2(s, s.bl_desc);
      for (max_blindex = BL_CODES2 - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order2[max_blindex] * 2 + 1] !== 0) {
          break;
        }
      }
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      return max_blindex;
    }
    function send_all_trees2(s, lcodes, dcodes, blcodes) {
      var rank2;
      send_bits2(s, lcodes - 257, 5);
      send_bits2(s, dcodes - 1, 5);
      send_bits2(s, blcodes - 4, 4);
      for (rank2 = 0; rank2 < blcodes; rank2++) {
        send_bits2(s, s.bl_tree[bl_order2[rank2] * 2 + 1], 3);
      }
      send_tree2(s, s.dyn_ltree, lcodes - 1);
      send_tree2(s, s.dyn_dtree, dcodes - 1);
    }
    function detect_data_type2(s) {
      var black_mask = 4093624447;
      var n;
      for (n = 0; n <= 31; n++, black_mask >>>= 1) {
        if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
          return Z_BINARY2;
        }
      }
      if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
        return Z_TEXT2;
      }
      for (n = 32; n < LITERALS2; n++) {
        if (s.dyn_ltree[n * 2] !== 0) {
          return Z_TEXT2;
        }
      }
      return Z_BINARY2;
    }
    var static_init_done2 = false;
    function _tr_init2(s) {
      if (!static_init_done2) {
        tr_static_init2();
        static_init_done2 = true;
      }
      s.l_desc = new TreeDesc2(s.dyn_ltree, static_l_desc2);
      s.d_desc = new TreeDesc2(s.dyn_dtree, static_d_desc2);
      s.bl_desc = new TreeDesc2(s.bl_tree, static_bl_desc2);
      s.bi_buf = 0;
      s.bi_valid = 0;
      init_block2(s);
    }
    function _tr_stored_block2(s, buf, stored_len, last) {
      send_bits2(s, (STORED_BLOCK2 << 1) + (last ? 1 : 0), 3);
      copy_block(s, buf, stored_len, true);
    }
    function _tr_align2(s) {
      send_bits2(s, STATIC_TREES2 << 1, 3);
      send_code2(s, END_BLOCK2, static_ltree2);
      bi_flush2(s);
    }
    function _tr_flush_block2(s, buf, stored_len, last) {
      var opt_lenb, static_lenb;
      var max_blindex = 0;
      if (s.level > 0) {
        if (s.strm.data_type === Z_UNKNOWN2) {
          s.strm.data_type = detect_data_type2(s);
        }
        build_tree2(s, s.l_desc);
        build_tree2(s, s.d_desc);
        max_blindex = build_bl_tree2(s);
        opt_lenb = s.opt_len + 3 + 7 >>> 3;
        static_lenb = s.static_len + 3 + 7 >>> 3;
        if (static_lenb <= opt_lenb) {
          opt_lenb = static_lenb;
        }
      } else {
        opt_lenb = static_lenb = stored_len + 5;
      }
      if (stored_len + 4 <= opt_lenb && buf !== -1) {
        _tr_stored_block2(s, buf, stored_len, last);
      } else if (s.strategy === Z_FIXED2 || static_lenb === opt_lenb) {
        send_bits2(s, (STATIC_TREES2 << 1) + (last ? 1 : 0), 3);
        compress_block2(s, static_ltree2, static_dtree2);
      } else {
        send_bits2(s, (DYN_TREES2 << 1) + (last ? 1 : 0), 3);
        send_all_trees2(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block2(s, s.dyn_ltree, s.dyn_dtree);
      }
      init_block2(s);
      if (last) {
        bi_windup2(s);
      }
    }
    function _tr_tally2(s, dist, lc) {
      s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
      s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
      s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
      s.last_lit++;
      if (dist === 0) {
        s.dyn_ltree[lc * 2]++;
      } else {
        s.matches++;
        dist--;
        s.dyn_ltree[(_length_code2[lc] + LITERALS2 + 1) * 2]++;
        s.dyn_dtree[d_code2(dist) * 2]++;
      }
      return s.last_lit === s.lit_bufsize - 1;
    }
    exports._tr_init = _tr_init2;
    exports._tr_stored_block = _tr_stored_block2;
    exports._tr_flush_block = _tr_flush_block2;
    exports._tr_tally = _tr_tally2;
    exports._tr_align = _tr_align2;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/adler32.js
var require_adler32 = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/adler32.js"(exports, module) {
    "use strict";
    function adler322(adler, buf, len, pos) {
      var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
      while (len !== 0) {
        n = len > 2e3 ? 2e3 : len;
        len -= n;
        do {
          s1 = s1 + buf[pos++] | 0;
          s2 = s2 + s1 | 0;
        } while (--n);
        s1 %= 65521;
        s2 %= 65521;
      }
      return s1 | s2 << 16 | 0;
    }
    module.exports = adler322;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/crc32.js
var require_crc32 = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/crc32.js"(exports, module) {
    "use strict";
    function makeTable2() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable2 = makeTable2();
    function crc322(crc, buf, len, pos) {
      var t = crcTable2, end = pos + len;
      crc ^= -1;
      for (var i2 = pos; i2 < end; i2++) {
        crc = crc >>> 8 ^ t[(crc ^ buf[i2]) & 255];
      }
      return crc ^ -1;
    }
    module.exports = crc322;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/messages.js
var require_messages = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/messages.js"(exports, module) {
    "use strict";
    module.exports = {
      2: "need dictionary",
      /* Z_NEED_DICT       2  */
      1: "stream end",
      /* Z_STREAM_END      1  */
      0: "",
      /* Z_OK              0  */
      "-1": "file error",
      /* Z_ERRNO         (-1) */
      "-2": "stream error",
      /* Z_STREAM_ERROR  (-2) */
      "-3": "data error",
      /* Z_DATA_ERROR    (-3) */
      "-4": "insufficient memory",
      /* Z_MEM_ERROR     (-4) */
      "-5": "buffer error",
      /* Z_BUF_ERROR     (-5) */
      "-6": "incompatible version"
      /* Z_VERSION_ERROR (-6) */
    };
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/deflate.js
var require_deflate = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/deflate.js"(exports) {
    "use strict";
    var utils = require_common();
    var trees2 = require_trees();
    var adler322 = require_adler32();
    var crc322 = require_crc32();
    var msg = require_messages();
    var Z_NO_FLUSH2 = 0;
    var Z_PARTIAL_FLUSH2 = 1;
    var Z_FULL_FLUSH2 = 3;
    var Z_FINISH2 = 4;
    var Z_BLOCK2 = 5;
    var Z_OK2 = 0;
    var Z_STREAM_END2 = 1;
    var Z_STREAM_ERROR2 = -2;
    var Z_DATA_ERROR2 = -3;
    var Z_BUF_ERROR2 = -5;
    var Z_DEFAULT_COMPRESSION2 = -1;
    var Z_FILTERED2 = 1;
    var Z_HUFFMAN_ONLY2 = 2;
    var Z_RLE2 = 3;
    var Z_FIXED2 = 4;
    var Z_DEFAULT_STRATEGY2 = 0;
    var Z_UNKNOWN2 = 2;
    var Z_DEFLATED2 = 8;
    var MAX_MEM_LEVEL2 = 9;
    var MAX_WBITS2 = 15;
    var DEF_MEM_LEVEL2 = 8;
    var LENGTH_CODES2 = 29;
    var LITERALS2 = 256;
    var L_CODES2 = LITERALS2 + 1 + LENGTH_CODES2;
    var D_CODES2 = 30;
    var BL_CODES2 = 19;
    var HEAP_SIZE2 = 2 * L_CODES2 + 1;
    var MAX_BITS2 = 15;
    var MIN_MATCH2 = 3;
    var MAX_MATCH2 = 258;
    var MIN_LOOKAHEAD2 = MAX_MATCH2 + MIN_MATCH2 + 1;
    var PRESET_DICT2 = 32;
    var INIT_STATE2 = 42;
    var EXTRA_STATE2 = 69;
    var NAME_STATE2 = 73;
    var COMMENT_STATE2 = 91;
    var HCRC_STATE2 = 103;
    var BUSY_STATE2 = 113;
    var FINISH_STATE2 = 666;
    var BS_NEED_MORE2 = 1;
    var BS_BLOCK_DONE2 = 2;
    var BS_FINISH_STARTED2 = 3;
    var BS_FINISH_DONE2 = 4;
    var OS_CODE2 = 3;
    function err2(strm, errorCode) {
      strm.msg = msg[errorCode];
      return errorCode;
    }
    function rank2(f) {
      return (f << 1) - (f > 4 ? 9 : 0);
    }
    function zero2(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    function flush_pending2(strm) {
      var s = strm.state;
      var len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) {
        return;
      }
      utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
      strm.next_out += len;
      s.pending_out += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    }
    function flush_block_only2(s, last) {
      trees2._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending2(s.strm);
    }
    function put_byte2(s, b) {
      s.pending_buf[s.pending++] = b;
    }
    function putShortMSB2(s, b) {
      s.pending_buf[s.pending++] = b >>> 8 & 255;
      s.pending_buf[s.pending++] = b & 255;
    }
    function read_buf2(strm, buf, start, size) {
      var len = strm.avail_in;
      if (len > size) {
        len = size;
      }
      if (len === 0) {
        return 0;
      }
      strm.avail_in -= len;
      utils.arraySet(buf, strm.input, strm.next_in, len, start);
      if (strm.state.wrap === 1) {
        strm.adler = adler322(strm.adler, buf, len, start);
      } else if (strm.state.wrap === 2) {
        strm.adler = crc322(strm.adler, buf, len, start);
      }
      strm.next_in += len;
      strm.total_in += len;
      return len;
    }
    function longest_match2(s, cur_match) {
      var chain_length = s.max_chain_length;
      var scan = s.strstart;
      var match;
      var len;
      var best_len = s.prev_length;
      var nice_match = s.nice_match;
      var limit = s.strstart > s.w_size - MIN_LOOKAHEAD2 ? s.strstart - (s.w_size - MIN_LOOKAHEAD2) : 0;
      var _win = s.window;
      var wmask = s.w_mask;
      var prev = s.prev;
      var strend = s.strstart + MAX_MATCH2;
      var scan_end1 = _win[scan + best_len - 1];
      var scan_end = _win[scan + best_len];
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      if (nice_match > s.lookahead) {
        nice_match = s.lookahead;
      }
      do {
        match = cur_match;
        if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
          continue;
        }
        scan += 2;
        match++;
        do {
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
        len = MAX_MATCH2 - (strend - scan);
        scan = strend - MAX_MATCH2;
        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
          }
          scan_end1 = _win[scan + best_len - 1];
          scan_end = _win[scan + best_len];
        }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    }
    function fill_window2(s) {
      var _w_size = s.w_size;
      var p, n, m, more, str;
      do {
        more = s.window_size - s.lookahead - s.strstart;
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD2)) {
          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          s.block_start -= _w_size;
          n = s.hash_size;
          p = n;
          do {
            m = s.head[--p];
            s.head[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          n = _w_size;
          p = n;
          do {
            m = s.prev[--p];
            s.prev[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }
        n = read_buf2(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;
        if (s.lookahead + s.insert >= MIN_MATCH2) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
          while (s.insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH2 - 1]) & s.hash_mask;
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH2) {
              break;
            }
          }
        }
      } while (s.lookahead < MIN_LOOKAHEAD2 && s.strm.avail_in !== 0);
    }
    function deflate_stored2(s, flush) {
      var max_block_size = 65535;
      if (max_block_size > s.pending_buf_size - 5) {
        max_block_size = s.pending_buf_size - 5;
      }
      for (; ; ) {
        if (s.lookahead <= 1) {
          fill_window2(s);
          if (s.lookahead === 0 && flush === Z_NO_FLUSH2) {
            return BS_NEED_MORE2;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.strstart += s.lookahead;
        s.lookahead = 0;
        var max_start = s.block_start + max_block_size;
        if (s.strstart === 0 || s.strstart >= max_start) {
          s.lookahead = s.strstart - max_start;
          s.strstart = max_start;
          flush_block_only2(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE2;
          }
        }
        if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD2) {
          flush_block_only2(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE2;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH2) {
        flush_block_only2(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED2;
        }
        return BS_FINISH_DONE2;
      }
      if (s.strstart > s.block_start) {
        flush_block_only2(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE2;
        }
      }
      return BS_NEED_MORE2;
    }
    function deflate_fast2(s, flush) {
      var hash_head;
      var bflush;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD2) {
          fill_window2(s);
          if (s.lookahead < MIN_LOOKAHEAD2 && flush === Z_NO_FLUSH2) {
            return BS_NEED_MORE2;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH2) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH2 - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD2) {
          s.match_length = longest_match2(s, hash_head);
        }
        if (s.match_length >= MIN_MATCH2) {
          bflush = trees2._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH2);
          s.lookahead -= s.match_length;
          if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH2) {
            s.match_length--;
            do {
              s.strstart++;
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH2 - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            } while (--s.match_length !== 0);
            s.strstart++;
          } else {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
          }
        } else {
          bflush = trees2._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only2(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE2;
          }
        }
      }
      s.insert = s.strstart < MIN_MATCH2 - 1 ? s.strstart : MIN_MATCH2 - 1;
      if (flush === Z_FINISH2) {
        flush_block_only2(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED2;
        }
        return BS_FINISH_DONE2;
      }
      if (s.last_lit) {
        flush_block_only2(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE2;
        }
      }
      return BS_BLOCK_DONE2;
    }
    function deflate_slow2(s, flush) {
      var hash_head;
      var bflush;
      var max_insert;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD2) {
          fill_window2(s);
          if (s.lookahead < MIN_LOOKAHEAD2 && flush === Z_NO_FLUSH2) {
            return BS_NEED_MORE2;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH2) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH2 - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH2 - 1;
        if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD2) {
          s.match_length = longest_match2(s, hash_head);
          if (s.match_length <= 5 && (s.strategy === Z_FILTERED2 || s.match_length === MIN_MATCH2 && s.strstart - s.match_start > 4096)) {
            s.match_length = MIN_MATCH2 - 1;
          }
        }
        if (s.prev_length >= MIN_MATCH2 && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH2;
          bflush = trees2._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH2);
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH2 - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
          } while (--s.prev_length !== 0);
          s.match_available = 0;
          s.match_length = MIN_MATCH2 - 1;
          s.strstart++;
          if (bflush) {
            flush_block_only2(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE2;
            }
          }
        } else if (s.match_available) {
          bflush = trees2._tr_tally(s, 0, s.window[s.strstart - 1]);
          if (bflush) {
            flush_block_only2(s, false);
          }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE2;
          }
        } else {
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      if (s.match_available) {
        bflush = trees2._tr_tally(s, 0, s.window[s.strstart - 1]);
        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH2 - 1 ? s.strstart : MIN_MATCH2 - 1;
      if (flush === Z_FINISH2) {
        flush_block_only2(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED2;
        }
        return BS_FINISH_DONE2;
      }
      if (s.last_lit) {
        flush_block_only2(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE2;
        }
      }
      return BS_BLOCK_DONE2;
    }
    function deflate_rle2(s, flush) {
      var bflush;
      var prev;
      var scan, strend;
      var _win = s.window;
      for (; ; ) {
        if (s.lookahead <= MAX_MATCH2) {
          fill_window2(s);
          if (s.lookahead <= MAX_MATCH2 && flush === Z_NO_FLUSH2) {
            return BS_NEED_MORE2;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH2 && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH2;
            do {
            } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
            s.match_length = MAX_MATCH2 - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
            }
          }
        }
        if (s.match_length >= MIN_MATCH2) {
          bflush = trees2._tr_tally(s, 1, s.match_length - MIN_MATCH2);
          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          bflush = trees2._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only2(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE2;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH2) {
        flush_block_only2(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED2;
        }
        return BS_FINISH_DONE2;
      }
      if (s.last_lit) {
        flush_block_only2(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE2;
        }
      }
      return BS_BLOCK_DONE2;
    }
    function deflate_huff2(s, flush) {
      var bflush;
      for (; ; ) {
        if (s.lookahead === 0) {
          fill_window2(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH2) {
              return BS_NEED_MORE2;
            }
            break;
          }
        }
        s.match_length = 0;
        bflush = trees2._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          flush_block_only2(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE2;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH2) {
        flush_block_only2(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED2;
        }
        return BS_FINISH_DONE2;
      }
      if (s.last_lit) {
        flush_block_only2(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE2;
        }
      }
      return BS_BLOCK_DONE2;
    }
    function Config2(good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
    var configuration_table2;
    configuration_table2 = [
      /*      good lazy nice chain */
      new Config2(0, 0, 0, 0, deflate_stored2),
      /* 0 store only */
      new Config2(4, 4, 8, 4, deflate_fast2),
      /* 1 max speed, no lazy matches */
      new Config2(4, 5, 16, 8, deflate_fast2),
      /* 2 */
      new Config2(4, 6, 32, 32, deflate_fast2),
      /* 3 */
      new Config2(4, 4, 16, 16, deflate_slow2),
      /* 4 lazy matches */
      new Config2(8, 16, 32, 32, deflate_slow2),
      /* 5 */
      new Config2(8, 16, 128, 128, deflate_slow2),
      /* 6 */
      new Config2(8, 32, 128, 256, deflate_slow2),
      /* 7 */
      new Config2(32, 128, 258, 1024, deflate_slow2),
      /* 8 */
      new Config2(32, 258, 258, 4096, deflate_slow2)
      /* 9 max compression */
    ];
    function lm_init2(s) {
      s.window_size = 2 * s.w_size;
      zero2(s.head);
      s.max_lazy_match = configuration_table2[s.level].max_lazy;
      s.good_match = configuration_table2[s.level].good_length;
      s.nice_match = configuration_table2[s.level].nice_length;
      s.max_chain_length = configuration_table2[s.level].max_chain;
      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH2 - 1;
      s.match_available = 0;
      s.ins_h = 0;
    }
    function DeflateState2() {
      this.strm = null;
      this.status = 0;
      this.pending_buf = null;
      this.pending_buf_size = 0;
      this.pending_out = 0;
      this.pending = 0;
      this.wrap = 0;
      this.gzhead = null;
      this.gzindex = 0;
      this.method = Z_DEFLATED2;
      this.last_flush = -1;
      this.w_size = 0;
      this.w_bits = 0;
      this.w_mask = 0;
      this.window = null;
      this.window_size = 0;
      this.prev = null;
      this.head = null;
      this.ins_h = 0;
      this.hash_size = 0;
      this.hash_bits = 0;
      this.hash_mask = 0;
      this.hash_shift = 0;
      this.block_start = 0;
      this.match_length = 0;
      this.prev_match = 0;
      this.match_available = 0;
      this.strstart = 0;
      this.match_start = 0;
      this.lookahead = 0;
      this.prev_length = 0;
      this.max_chain_length = 0;
      this.max_lazy_match = 0;
      this.level = 0;
      this.strategy = 0;
      this.good_match = 0;
      this.nice_match = 0;
      this.dyn_ltree = new utils.Buf16(HEAP_SIZE2 * 2);
      this.dyn_dtree = new utils.Buf16((2 * D_CODES2 + 1) * 2);
      this.bl_tree = new utils.Buf16((2 * BL_CODES2 + 1) * 2);
      zero2(this.dyn_ltree);
      zero2(this.dyn_dtree);
      zero2(this.bl_tree);
      this.l_desc = null;
      this.d_desc = null;
      this.bl_desc = null;
      this.bl_count = new utils.Buf16(MAX_BITS2 + 1);
      this.heap = new utils.Buf16(2 * L_CODES2 + 1);
      zero2(this.heap);
      this.heap_len = 0;
      this.heap_max = 0;
      this.depth = new utils.Buf16(2 * L_CODES2 + 1);
      zero2(this.depth);
      this.l_buf = 0;
      this.lit_bufsize = 0;
      this.last_lit = 0;
      this.d_buf = 0;
      this.opt_len = 0;
      this.static_len = 0;
      this.matches = 0;
      this.insert = 0;
      this.bi_buf = 0;
      this.bi_valid = 0;
    }
    function deflateResetKeep2(strm) {
      var s;
      if (!strm || !strm.state) {
        return err2(strm, Z_STREAM_ERROR2);
      }
      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN2;
      s = strm.state;
      s.pending = 0;
      s.pending_out = 0;
      if (s.wrap < 0) {
        s.wrap = -s.wrap;
      }
      s.status = s.wrap ? INIT_STATE2 : BUSY_STATE2;
      strm.adler = s.wrap === 2 ? 0 : 1;
      s.last_flush = Z_NO_FLUSH2;
      trees2._tr_init(s);
      return Z_OK2;
    }
    function deflateReset2(strm) {
      var ret = deflateResetKeep2(strm);
      if (ret === Z_OK2) {
        lm_init2(strm.state);
      }
      return ret;
    }
    function deflateSetHeader2(strm, head) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      if (strm.state.wrap !== 2) {
        return Z_STREAM_ERROR2;
      }
      strm.state.gzhead = head;
      return Z_OK2;
    }
    function deflateInit22(strm, level, method, windowBits, memLevel, strategy) {
      if (!strm) {
        return Z_STREAM_ERROR2;
      }
      var wrap = 1;
      if (level === Z_DEFAULT_COMPRESSION2) {
        level = 6;
      }
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else if (windowBits > 15) {
        wrap = 2;
        windowBits -= 16;
      }
      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL2 || method !== Z_DEFLATED2 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED2) {
        return err2(strm, Z_STREAM_ERROR2);
      }
      if (windowBits === 8) {
        windowBits = 9;
      }
      var s = new DeflateState2();
      strm.state = s;
      s.strm = strm;
      s.wrap = wrap;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;
      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH2 - 1) / MIN_MATCH2);
      s.window = new utils.Buf8(s.w_size * 2);
      s.head = new utils.Buf16(s.hash_size);
      s.prev = new utils.Buf16(s.w_size);
      s.lit_bufsize = 1 << memLevel + 6;
      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new utils.Buf8(s.pending_buf_size);
      s.d_buf = 1 * s.lit_bufsize;
      s.l_buf = (1 + 2) * s.lit_bufsize;
      s.level = level;
      s.strategy = strategy;
      s.method = method;
      return deflateReset2(strm);
    }
    function deflateInit3(strm, level) {
      return deflateInit22(strm, level, Z_DEFLATED2, MAX_WBITS2, DEF_MEM_LEVEL2, Z_DEFAULT_STRATEGY2);
    }
    function deflate2(strm, flush) {
      var old_flush, s;
      var beg, val;
      if (!strm || !strm.state || flush > Z_BLOCK2 || flush < 0) {
        return strm ? err2(strm, Z_STREAM_ERROR2) : Z_STREAM_ERROR2;
      }
      s = strm.state;
      if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE2 && flush !== Z_FINISH2) {
        return err2(strm, strm.avail_out === 0 ? Z_BUF_ERROR2 : Z_STREAM_ERROR2);
      }
      s.strm = strm;
      old_flush = s.last_flush;
      s.last_flush = flush;
      if (s.status === INIT_STATE2) {
        if (s.wrap === 2) {
          strm.adler = 0;
          put_byte2(s, 31);
          put_byte2(s, 139);
          put_byte2(s, 8);
          if (!s.gzhead) {
            put_byte2(s, 0);
            put_byte2(s, 0);
            put_byte2(s, 0);
            put_byte2(s, 0);
            put_byte2(s, 0);
            put_byte2(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY2 || s.level < 2 ? 4 : 0);
            put_byte2(s, OS_CODE2);
            s.status = BUSY_STATE2;
          } else {
            put_byte2(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte2(s, s.gzhead.time & 255);
            put_byte2(s, s.gzhead.time >> 8 & 255);
            put_byte2(s, s.gzhead.time >> 16 & 255);
            put_byte2(s, s.gzhead.time >> 24 & 255);
            put_byte2(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY2 || s.level < 2 ? 4 : 0);
            put_byte2(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte2(s, s.gzhead.extra.length & 255);
              put_byte2(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc322(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE2;
          }
        } else {
          var header = Z_DEFLATED2 + (s.w_bits - 8 << 4) << 8;
          var level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY2 || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT2;
          }
          header += 31 - header % 31;
          s.status = BUSY_STATE2;
          putShortMSB2(s, header);
          if (s.strstart !== 0) {
            putShortMSB2(s, strm.adler >>> 16);
            putShortMSB2(s, strm.adler & 65535);
          }
          strm.adler = 1;
        }
      }
      if (s.status === EXTRA_STATE2) {
        if (s.gzhead.extra) {
          beg = s.pending;
          while (s.gzindex < (s.gzhead.extra.length & 65535)) {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc322(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending2(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                break;
              }
            }
            put_byte2(s, s.gzhead.extra[s.gzindex] & 255);
            s.gzindex++;
          }
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc322(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (s.gzindex === s.gzhead.extra.length) {
            s.gzindex = 0;
            s.status = NAME_STATE2;
          }
        } else {
          s.status = NAME_STATE2;
        }
      }
      if (s.status === NAME_STATE2) {
        if (s.gzhead.name) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc322(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending2(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte2(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc322(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.gzindex = 0;
            s.status = COMMENT_STATE2;
          }
        } else {
          s.status = COMMENT_STATE2;
        }
      }
      if (s.status === COMMENT_STATE2) {
        if (s.gzhead.comment) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc322(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending2(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte2(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc322(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.status = HCRC_STATE2;
          }
        } else {
          s.status = HCRC_STATE2;
        }
      }
      if (s.status === HCRC_STATE2) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
            flush_pending2(strm);
          }
          if (s.pending + 2 <= s.pending_buf_size) {
            put_byte2(s, strm.adler & 255);
            put_byte2(s, strm.adler >> 8 & 255);
            strm.adler = 0;
            s.status = BUSY_STATE2;
          }
        } else {
          s.status = BUSY_STATE2;
        }
      }
      if (s.pending !== 0) {
        flush_pending2(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK2;
        }
      } else if (strm.avail_in === 0 && rank2(flush) <= rank2(old_flush) && flush !== Z_FINISH2) {
        return err2(strm, Z_BUF_ERROR2);
      }
      if (s.status === FINISH_STATE2 && strm.avail_in !== 0) {
        return err2(strm, Z_BUF_ERROR2);
      }
      if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH2 && s.status !== FINISH_STATE2) {
        var bstate = s.strategy === Z_HUFFMAN_ONLY2 ? deflate_huff2(s, flush) : s.strategy === Z_RLE2 ? deflate_rle2(s, flush) : configuration_table2[s.level].func(s, flush);
        if (bstate === BS_FINISH_STARTED2 || bstate === BS_FINISH_DONE2) {
          s.status = FINISH_STATE2;
        }
        if (bstate === BS_NEED_MORE2 || bstate === BS_FINISH_STARTED2) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
          }
          return Z_OK2;
        }
        if (bstate === BS_BLOCK_DONE2) {
          if (flush === Z_PARTIAL_FLUSH2) {
            trees2._tr_align(s);
          } else if (flush !== Z_BLOCK2) {
            trees2._tr_stored_block(s, 0, 0, false);
            if (flush === Z_FULL_FLUSH2) {
              zero2(s.head);
              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
          flush_pending2(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK2;
          }
        }
      }
      if (flush !== Z_FINISH2) {
        return Z_OK2;
      }
      if (s.wrap <= 0) {
        return Z_STREAM_END2;
      }
      if (s.wrap === 2) {
        put_byte2(s, strm.adler & 255);
        put_byte2(s, strm.adler >> 8 & 255);
        put_byte2(s, strm.adler >> 16 & 255);
        put_byte2(s, strm.adler >> 24 & 255);
        put_byte2(s, strm.total_in & 255);
        put_byte2(s, strm.total_in >> 8 & 255);
        put_byte2(s, strm.total_in >> 16 & 255);
        put_byte2(s, strm.total_in >> 24 & 255);
      } else {
        putShortMSB2(s, strm.adler >>> 16);
        putShortMSB2(s, strm.adler & 65535);
      }
      flush_pending2(strm);
      if (s.wrap > 0) {
        s.wrap = -s.wrap;
      }
      return s.pending !== 0 ? Z_OK2 : Z_STREAM_END2;
    }
    function deflateEnd2(strm) {
      var status2;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      status2 = strm.state.status;
      if (status2 !== INIT_STATE2 && status2 !== EXTRA_STATE2 && status2 !== NAME_STATE2 && status2 !== COMMENT_STATE2 && status2 !== HCRC_STATE2 && status2 !== BUSY_STATE2 && status2 !== FINISH_STATE2) {
        return err2(strm, Z_STREAM_ERROR2);
      }
      strm.state = null;
      return status2 === BUSY_STATE2 ? err2(strm, Z_DATA_ERROR2) : Z_OK2;
    }
    function deflateSetDictionary2(strm, dictionary) {
      var dictLength = dictionary.length;
      var s;
      var str, n;
      var wrap;
      var avail;
      var next;
      var input;
      var tmpDict;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      s = strm.state;
      wrap = s.wrap;
      if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE2 || s.lookahead) {
        return Z_STREAM_ERROR2;
      }
      if (wrap === 1) {
        strm.adler = adler322(strm.adler, dictionary, dictLength, 0);
      }
      s.wrap = 0;
      if (dictLength >= s.w_size) {
        if (wrap === 0) {
          zero2(s.head);
          s.strstart = 0;
          s.block_start = 0;
          s.insert = 0;
        }
        tmpDict = new utils.Buf8(s.w_size);
        utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
        dictionary = tmpDict;
        dictLength = s.w_size;
      }
      avail = strm.avail_in;
      next = strm.next_in;
      input = strm.input;
      strm.avail_in = dictLength;
      strm.next_in = 0;
      strm.input = dictionary;
      fill_window2(s);
      while (s.lookahead >= MIN_MATCH2) {
        str = s.strstart;
        n = s.lookahead - (MIN_MATCH2 - 1);
        do {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH2 - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
        } while (--n);
        s.strstart = str;
        s.lookahead = MIN_MATCH2 - 1;
        fill_window2(s);
      }
      s.strstart += s.lookahead;
      s.block_start = s.strstart;
      s.insert = s.lookahead;
      s.lookahead = 0;
      s.match_length = s.prev_length = MIN_MATCH2 - 1;
      s.match_available = 0;
      strm.next_in = next;
      strm.input = input;
      strm.avail_in = avail;
      s.wrap = wrap;
      return Z_OK2;
    }
    exports.deflateInit = deflateInit3;
    exports.deflateInit2 = deflateInit22;
    exports.deflateReset = deflateReset2;
    exports.deflateResetKeep = deflateResetKeep2;
    exports.deflateSetHeader = deflateSetHeader2;
    exports.deflate = deflate2;
    exports.deflateEnd = deflateEnd2;
    exports.deflateSetDictionary = deflateSetDictionary2;
    exports.deflateInfo = "pako deflate (from Nodeca project)";
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/strings.js
var require_strings = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/strings.js"(exports) {
    "use strict";
    var utils = require_common();
    var STR_APPLY_OK = true;
    var STR_APPLY_UIA_OK2 = true;
    try {
      String.fromCharCode.apply(null, [0]);
    } catch (__) {
      STR_APPLY_OK = false;
    }
    try {
      String.fromCharCode.apply(null, new Uint8Array(1));
    } catch (__) {
      STR_APPLY_UIA_OK2 = false;
    }
    var _utf8len2 = new utils.Buf8(256);
    for (q = 0; q < 256; q++) {
      _utf8len2[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
    }
    var q;
    _utf8len2[254] = _utf8len2[254] = 1;
    exports.string2buf = function(str) {
      var buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      buf = new utils.Buf8(buf_len);
      for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i2++] = c;
        } else if (c < 2048) {
          buf[i2++] = 192 | c >>> 6;
          buf[i2++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i2++] = 224 | c >>> 12;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        } else {
          buf[i2++] = 240 | c >>> 18;
          buf[i2++] = 128 | c >>> 12 & 63;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        }
      }
      return buf;
    };
    function buf2binstring2(buf, len) {
      if (len < 65534) {
        if (buf.subarray && STR_APPLY_UIA_OK2 || !buf.subarray && STR_APPLY_OK) {
          return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
        }
      }
      var result = "";
      for (var i2 = 0; i2 < len; i2++) {
        result += String.fromCharCode(buf[i2]);
      }
      return result;
    }
    exports.buf2binstring = function(buf) {
      return buf2binstring2(buf, buf.length);
    };
    exports.binstring2buf = function(str) {
      var buf = new utils.Buf8(str.length);
      for (var i2 = 0, len = buf.length; i2 < len; i2++) {
        buf[i2] = str.charCodeAt(i2);
      }
      return buf;
    };
    exports.buf2string = function(buf, max) {
      var i2, out, c, c_len;
      var len = max || buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i2 = 0; i2 < len; ) {
        c = buf[i2++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len2[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i2 += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i2 < len) {
          c = c << 6 | buf[i2++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      return buf2binstring2(utf16buf, out);
    };
    exports.utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len2[buf[pos]] > max ? pos : max;
    };
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/zstream.js
var require_zstream = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/zstream.js"(exports, module) {
    "use strict";
    function ZStream2() {
      this.input = null;
      this.next_in = 0;
      this.avail_in = 0;
      this.total_in = 0;
      this.output = null;
      this.next_out = 0;
      this.avail_out = 0;
      this.total_out = 0;
      this.msg = "";
      this.state = null;
      this.data_type = 2;
      this.adler = 0;
    }
    module.exports = ZStream2;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/deflate.js
var require_deflate2 = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/deflate.js"(exports) {
    "use strict";
    var zlib_deflate = require_deflate();
    var utils = require_common();
    var strings2 = require_strings();
    var msg = require_messages();
    var ZStream2 = require_zstream();
    var toString2 = Object.prototype.toString;
    var Z_NO_FLUSH2 = 0;
    var Z_FINISH2 = 4;
    var Z_OK2 = 0;
    var Z_STREAM_END2 = 1;
    var Z_SYNC_FLUSH2 = 2;
    var Z_DEFAULT_COMPRESSION2 = -1;
    var Z_DEFAULT_STRATEGY2 = 0;
    var Z_DEFLATED2 = 8;
    function Deflate2(options) {
      if (!(this instanceof Deflate2)) return new Deflate2(options);
      this.options = utils.assign({
        level: Z_DEFAULT_COMPRESSION2,
        method: Z_DEFLATED2,
        chunkSize: 16384,
        windowBits: 15,
        memLevel: 8,
        strategy: Z_DEFAULT_STRATEGY2,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits > 0) {
        opt.windowBits = -opt.windowBits;
      } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
        opt.windowBits += 16;
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream2();
      this.strm.avail_out = 0;
      var status2 = zlib_deflate.deflateInit2(
        this.strm,
        opt.level,
        opt.method,
        opt.windowBits,
        opt.memLevel,
        opt.strategy
      );
      if (status2 !== Z_OK2) {
        throw new Error(msg[status2]);
      }
      if (opt.header) {
        zlib_deflate.deflateSetHeader(this.strm, opt.header);
      }
      if (opt.dictionary) {
        var dict;
        if (typeof opt.dictionary === "string") {
          dict = strings2.string2buf(opt.dictionary);
        } else if (toString2.call(opt.dictionary) === "[object ArrayBuffer]") {
          dict = new Uint8Array(opt.dictionary);
        } else {
          dict = opt.dictionary;
        }
        status2 = zlib_deflate.deflateSetDictionary(this.strm, dict);
        if (status2 !== Z_OK2) {
          throw new Error(msg[status2]);
        }
        this._dict_set = true;
      }
    }
    Deflate2.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var status2, _mode;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH2 : Z_NO_FLUSH2;
      if (typeof data === "string") {
        strm.input = strings2.string2buf(data);
      } else if (toString2.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status2 = zlib_deflate.deflate(strm, _mode);
        if (status2 !== Z_STREAM_END2 && status2 !== Z_OK2) {
          this.onEnd(status2);
          this.ended = true;
          return false;
        }
        if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH2 || _mode === Z_SYNC_FLUSH2)) {
          if (this.options.to === "string") {
            this.onData(strings2.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
          } else {
            this.onData(utils.shrinkBuf(strm.output, strm.next_out));
          }
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status2 !== Z_STREAM_END2);
      if (_mode === Z_FINISH2) {
        status2 = zlib_deflate.deflateEnd(this.strm);
        this.onEnd(status2);
        this.ended = true;
        return status2 === Z_OK2;
      }
      if (_mode === Z_SYNC_FLUSH2) {
        this.onEnd(Z_OK2);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Deflate2.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Deflate2.prototype.onEnd = function(status2) {
      if (status2 === Z_OK2) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status2;
      this.msg = this.strm.msg;
    };
    function deflate2(input, options) {
      var deflator = new Deflate2(options);
      deflator.push(input, true);
      if (deflator.err) {
        throw deflator.msg || msg[deflator.err];
      }
      return deflator.result;
    }
    function deflateRaw2(input, options) {
      options = options || {};
      options.raw = true;
      return deflate2(input, options);
    }
    function gzip2(input, options) {
      options = options || {};
      options.gzip = true;
      return deflate2(input, options);
    }
    exports.Deflate = Deflate2;
    exports.deflate = deflate2;
    exports.deflateRaw = deflateRaw2;
    exports.gzip = gzip2;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inffast.js
var require_inffast = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inffast.js"(exports, module) {
    "use strict";
    var BAD2 = 30;
    var TYPE2 = 12;
    module.exports = function inflate_fast2(strm, start) {
      var state;
      var _in;
      var last;
      var _out;
      var beg;
      var end;
      var dmax;
      var wsize;
      var whave;
      var wnext;
      var s_window;
      var hold;
      var bits;
      var lcode;
      var dcode;
      var lmask;
      var dmask;
      var here;
      var op;
      var len;
      var dist;
      var from;
      var from_source;
      var input, output;
      state = strm.state;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
      dmax = state.dmax;
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;
      top:
        do {
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = lcode[hold & lmask];
          dolen:
            for (; ; ) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = here >>> 16 & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & (1 << op) - 1;
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist:
                  for (; ; ) {
                    op = here >>> 24;
                    hold >>>= op;
                    bits -= op;
                    op = here >>> 16 & 255;
                    if (op & 16) {
                      dist = here & 65535;
                      op &= 15;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                        }
                      }
                      dist += hold & (1 << op) - 1;
                      if (dist > dmax) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD2;
                        break top;
                      }
                      hold >>>= op;
                      bits -= op;
                      op = _out - beg;
                      if (dist > op) {
                        op = dist - op;
                        if (op > whave) {
                          if (state.sane) {
                            strm.msg = "invalid distance too far back";
                            state.mode = BAD2;
                            break top;
                          }
                        }
                        from = 0;
                        from_source = s_window;
                        if (wnext === 0) {
                          from += wsize - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        } else if (wnext < op) {
                          from += wsize + wnext - op;
                          op -= wnext;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = 0;
                            if (wnext < len) {
                              op = wnext;
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                        } else {
                          from += wnext - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                        while (len > 2) {
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          len -= 3;
                        }
                        if (len) {
                          output[_out++] = from_source[from++];
                          if (len > 1) {
                            output[_out++] = from_source[from++];
                          }
                        }
                      } else {
                        from = _out - dist;
                        do {
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          len -= 3;
                        } while (len > 2);
                        if (len) {
                          output[_out++] = output[from++];
                          if (len > 1) {
                            output[_out++] = output[from++];
                          }
                        }
                      }
                    } else if ((op & 64) === 0) {
                      here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                      continue dodist;
                    } else {
                      strm.msg = "invalid distance code";
                      state.mode = BAD2;
                      break top;
                    }
                    break;
                  }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE2;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD2;
                break top;
              }
              break;
            }
        } while (_in < last && _out < end);
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
      strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
      state.hold = hold;
      state.bits = bits;
      return;
    };
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inftrees.js
var require_inftrees = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
    "use strict";
    var utils = require_common();
    var MAXBITS2 = 15;
    var ENOUGH_LENS2 = 852;
    var ENOUGH_DISTS2 = 592;
    var CODES2 = 0;
    var LENS2 = 1;
    var DISTS2 = 2;
    var lbase2 = [
      /* Length codes 257..285 base */
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      13,
      15,
      17,
      19,
      23,
      27,
      31,
      35,
      43,
      51,
      59,
      67,
      83,
      99,
      115,
      131,
      163,
      195,
      227,
      258,
      0,
      0
    ];
    var lext2 = [
      /* Length codes 257..285 extra */
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      17,
      17,
      17,
      17,
      18,
      18,
      18,
      18,
      19,
      19,
      19,
      19,
      20,
      20,
      20,
      20,
      21,
      21,
      21,
      21,
      16,
      72,
      78
    ];
    var dbase2 = [
      /* Distance codes 0..29 base */
      1,
      2,
      3,
      4,
      5,
      7,
      9,
      13,
      17,
      25,
      33,
      49,
      65,
      97,
      129,
      193,
      257,
      385,
      513,
      769,
      1025,
      1537,
      2049,
      3073,
      4097,
      6145,
      8193,
      12289,
      16385,
      24577,
      0,
      0
    ];
    var dext2 = [
      /* Distance codes 0..29 extra */
      16,
      16,
      16,
      16,
      17,
      17,
      18,
      18,
      19,
      19,
      20,
      20,
      21,
      21,
      22,
      22,
      23,
      23,
      24,
      24,
      25,
      25,
      26,
      26,
      27,
      27,
      28,
      28,
      29,
      29,
      64,
      64
    ];
    module.exports = function inflate_table2(type, lens, lens_index, codes, table, table_index, work, opts) {
      var bits = opts.bits;
      var len = 0;
      var sym = 0;
      var min = 0, max = 0;
      var root = 0;
      var curr = 0;
      var drop = 0;
      var left = 0;
      var used = 0;
      var huff = 0;
      var incr;
      var fill;
      var low;
      var mask;
      var next;
      var base = null;
      var base_index = 0;
      var end;
      var count = new utils.Buf16(MAXBITS2 + 1);
      var offs = new utils.Buf16(MAXBITS2 + 1);
      var extra = null;
      var extra_index = 0;
      var here_bits, here_op, here_val;
      for (len = 0; len <= MAXBITS2; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }
      root = bits;
      for (max = MAXBITS2; max >= 1; max--) {
        if (count[max] !== 0) {
          break;
        }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        opts.bits = 1;
        return 0;
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) {
          break;
        }
      }
      if (root < min) {
        root = min;
      }
      left = 1;
      for (len = 1; len <= MAXBITS2; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }
      }
      if (left > 0 && (type === CODES2 || max !== 1)) {
        return -1;
      }
      offs[1] = 0;
      for (len = 1; len < MAXBITS2; len++) {
        offs[len + 1] = offs[len] + count[len];
      }
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }
      if (type === CODES2) {
        base = extra = work;
        end = 19;
      } else if (type === LENS2) {
        base = lbase2;
        base_index -= 257;
        extra = lext2;
        extra_index -= 257;
        end = 256;
      } else {
        base = dbase2;
        extra = dext2;
        end = -1;
      }
      huff = 0;
      sym = 0;
      len = min;
      next = table_index;
      curr = root;
      drop = 0;
      low = -1;
      used = 1 << root;
      mask = used - 1;
      if (type === LENS2 && used > ENOUGH_LENS2 || type === DISTS2 && used > ENOUGH_DISTS2) {
        return 1;
      }
      for (; ; ) {
        here_bits = len - drop;
        if (work[sym] < end) {
          here_op = 0;
          here_val = work[sym];
        } else if (work[sym] > end) {
          here_op = extra[extra_index + work[sym]];
          here_val = base[base_index + work[sym]];
        } else {
          here_op = 32 + 64;
          here_val = 0;
        }
        incr = 1 << len - drop;
        fill = 1 << curr;
        min = fill;
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
        } while (fill !== 0);
        incr = 1 << len - 1;
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
          huff = 0;
        }
        sym++;
        if (--count[len] === 0) {
          if (len === max) {
            break;
          }
          len = lens[lens_index + work[sym]];
        }
        if (len > root && (huff & mask) !== low) {
          if (drop === 0) {
            drop = root;
          }
          next += min;
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) {
              break;
            }
            curr++;
            left <<= 1;
          }
          used += 1 << curr;
          if (type === LENS2 && used > ENOUGH_LENS2 || type === DISTS2 && used > ENOUGH_DISTS2) {
            return 1;
          }
          low = huff & mask;
          table[low] = root << 24 | curr << 16 | next - table_index | 0;
        }
      }
      if (huff !== 0) {
        table[next + huff] = len - drop << 24 | 64 << 16 | 0;
      }
      opts.bits = root;
      return 0;
    };
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inflate.js
var require_inflate = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inflate.js"(exports) {
    "use strict";
    var utils = require_common();
    var adler322 = require_adler32();
    var crc322 = require_crc32();
    var inflate_fast2 = require_inffast();
    var inflate_table2 = require_inftrees();
    var CODES2 = 0;
    var LENS2 = 1;
    var DISTS2 = 2;
    var Z_FINISH2 = 4;
    var Z_BLOCK2 = 5;
    var Z_TREES2 = 6;
    var Z_OK2 = 0;
    var Z_STREAM_END2 = 1;
    var Z_NEED_DICT2 = 2;
    var Z_STREAM_ERROR2 = -2;
    var Z_DATA_ERROR2 = -3;
    var Z_MEM_ERROR2 = -4;
    var Z_BUF_ERROR2 = -5;
    var Z_DEFLATED2 = 8;
    var HEAD2 = 1;
    var FLAGS2 = 2;
    var TIME2 = 3;
    var OS2 = 4;
    var EXLEN2 = 5;
    var EXTRA2 = 6;
    var NAME2 = 7;
    var COMMENT2 = 8;
    var HCRC2 = 9;
    var DICTID2 = 10;
    var DICT2 = 11;
    var TYPE2 = 12;
    var TYPEDO2 = 13;
    var STORED2 = 14;
    var COPY_2 = 15;
    var COPY2 = 16;
    var TABLE2 = 17;
    var LENLENS2 = 18;
    var CODELENS2 = 19;
    var LEN_2 = 20;
    var LEN2 = 21;
    var LENEXT2 = 22;
    var DIST2 = 23;
    var DISTEXT2 = 24;
    var MATCH2 = 25;
    var LIT2 = 26;
    var CHECK2 = 27;
    var LENGTH2 = 28;
    var DONE2 = 29;
    var BAD2 = 30;
    var MEM2 = 31;
    var SYNC2 = 32;
    var ENOUGH_LENS2 = 852;
    var ENOUGH_DISTS2 = 592;
    var MAX_WBITS2 = 15;
    var DEF_WBITS2 = MAX_WBITS2;
    function zswap322(q) {
      return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
    }
    function InflateState2() {
      this.mode = 0;
      this.last = false;
      this.wrap = 0;
      this.havedict = false;
      this.flags = 0;
      this.dmax = 0;
      this.check = 0;
      this.total = 0;
      this.head = null;
      this.wbits = 0;
      this.wsize = 0;
      this.whave = 0;
      this.wnext = 0;
      this.window = null;
      this.hold = 0;
      this.bits = 0;
      this.length = 0;
      this.offset = 0;
      this.extra = 0;
      this.lencode = null;
      this.distcode = null;
      this.lenbits = 0;
      this.distbits = 0;
      this.ncode = 0;
      this.nlen = 0;
      this.ndist = 0;
      this.have = 0;
      this.next = null;
      this.lens = new utils.Buf16(320);
      this.work = new utils.Buf16(288);
      this.lendyn = null;
      this.distdyn = null;
      this.sane = 0;
      this.back = 0;
      this.was = 0;
    }
    function inflateResetKeep2(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = "";
      if (state.wrap) {
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD2;
      state.last = 0;
      state.havedict = 0;
      state.dmax = 32768;
      state.head = null;
      state.hold = 0;
      state.bits = 0;
      state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS2);
      state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS2);
      state.sane = 1;
      state.back = -1;
      return Z_OK2;
    }
    function inflateReset3(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep2(strm);
    }
    function inflateReset22(strm, windowBits) {
      var wrap;
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      state = strm.state;
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else {
        wrap = (windowBits >> 4) + 1;
        if (windowBits < 48) {
          windowBits &= 15;
        }
      }
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR2;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }
      state.wrap = wrap;
      state.wbits = windowBits;
      return inflateReset3(strm);
    }
    function inflateInit22(strm, windowBits) {
      var ret;
      var state;
      if (!strm) {
        return Z_STREAM_ERROR2;
      }
      state = new InflateState2();
      strm.state = state;
      state.window = null;
      ret = inflateReset22(strm, windowBits);
      if (ret !== Z_OK2) {
        strm.state = null;
      }
      return ret;
    }
    function inflateInit3(strm) {
      return inflateInit22(strm, DEF_WBITS2);
    }
    var virgin2 = true;
    var lenfix2;
    var distfix2;
    function fixedtables2(state) {
      if (virgin2) {
        var sym;
        lenfix2 = new utils.Buf32(512);
        distfix2 = new utils.Buf32(32);
        sym = 0;
        while (sym < 144) {
          state.lens[sym++] = 8;
        }
        while (sym < 256) {
          state.lens[sym++] = 9;
        }
        while (sym < 280) {
          state.lens[sym++] = 7;
        }
        while (sym < 288) {
          state.lens[sym++] = 8;
        }
        inflate_table2(LENS2, state.lens, 0, 288, lenfix2, 0, state.work, { bits: 9 });
        sym = 0;
        while (sym < 32) {
          state.lens[sym++] = 5;
        }
        inflate_table2(DISTS2, state.lens, 0, 32, distfix2, 0, state.work, { bits: 5 });
        virgin2 = false;
      }
      state.lencode = lenfix2;
      state.lenbits = 9;
      state.distcode = distfix2;
      state.distbits = 5;
    }
    function updatewindow2(strm, src, end, copy) {
      var dist;
      var state = strm.state;
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;
        state.window = new utils.Buf8(state.wsize);
      }
      if (copy >= state.wsize) {
        utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
        state.wnext = 0;
        state.whave = state.wsize;
      } else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
        }
        utils.arraySet(state.window, src, end - copy, dist, state.wnext);
        copy -= dist;
        if (copy) {
          utils.arraySet(state.window, src, end - copy, copy, 0);
          state.wnext = copy;
          state.whave = state.wsize;
        } else {
          state.wnext += dist;
          if (state.wnext === state.wsize) {
            state.wnext = 0;
          }
          if (state.whave < state.wsize) {
            state.whave += dist;
          }
        }
      }
      return 0;
    }
    function inflate3(strm, flush) {
      var state;
      var input, output;
      var next;
      var put;
      var have, left;
      var hold;
      var bits;
      var _in, _out;
      var copy;
      var from;
      var from_source;
      var here = 0;
      var here_bits, here_op, here_val;
      var last_bits, last_op, last_val;
      var len;
      var ret;
      var hbuf = new utils.Buf8(4);
      var opts;
      var n;
      var order = (
        /* permutation of code lengths */
        [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
      );
      if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
        return Z_STREAM_ERROR2;
      }
      state = strm.state;
      if (state.mode === TYPE2) {
        state.mode = TYPEDO2;
      }
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      _in = have;
      _out = left;
      ret = Z_OK2;
      inf_leave:
        for (; ; ) {
          switch (state.mode) {
            case HEAD2:
              if (state.wrap === 0) {
                state.mode = TYPEDO2;
                break;
              }
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 2 && hold === 35615) {
                state.check = 0;
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc322(state.check, hbuf, 2, 0);
                hold = 0;
                bits = 0;
                state.mode = FLAGS2;
                break;
              }
              state.flags = 0;
              if (state.head) {
                state.head.done = false;
              }
              if (!(state.wrap & 1) || /* check if zlib header allowed */
              (((hold & 255) << 8) + (hold >> 8)) % 31) {
                strm.msg = "incorrect header check";
                state.mode = BAD2;
                break;
              }
              if ((hold & 15) !== Z_DEFLATED2) {
                strm.msg = "unknown compression method";
                state.mode = BAD2;
                break;
              }
              hold >>>= 4;
              bits -= 4;
              len = (hold & 15) + 8;
              if (state.wbits === 0) {
                state.wbits = len;
              } else if (len > state.wbits) {
                strm.msg = "invalid window size";
                state.mode = BAD2;
                break;
              }
              state.dmax = 1 << len;
              strm.adler = state.check = 1;
              state.mode = hold & 512 ? DICTID2 : TYPE2;
              hold = 0;
              bits = 0;
              break;
            case FLAGS2:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.flags = hold;
              if ((state.flags & 255) !== Z_DEFLATED2) {
                strm.msg = "unknown compression method";
                state.mode = BAD2;
                break;
              }
              if (state.flags & 57344) {
                strm.msg = "unknown header flags set";
                state.mode = BAD2;
                break;
              }
              if (state.head) {
                state.head.text = hold >> 8 & 1;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc322(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = TIME2;
            /* falls through */
            case TIME2:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.time = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                hbuf[2] = hold >>> 16 & 255;
                hbuf[3] = hold >>> 24 & 255;
                state.check = crc322(state.check, hbuf, 4, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = OS2;
            /* falls through */
            case OS2:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.xflags = hold & 255;
                state.head.os = hold >> 8;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc322(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = EXLEN2;
            /* falls through */
            case EXLEN2:
              if (state.flags & 1024) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length = hold;
                if (state.head) {
                  state.head.extra_len = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc322(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
              } else if (state.head) {
                state.head.extra = null;
              }
              state.mode = EXTRA2;
            /* falls through */
            case EXTRA2:
              if (state.flags & 1024) {
                copy = state.length;
                if (copy > have) {
                  copy = have;
                }
                if (copy) {
                  if (state.head) {
                    len = state.head.extra_len - state.length;
                    if (!state.head.extra) {
                      state.head.extra = new Array(state.head.extra_len);
                    }
                    utils.arraySet(
                      state.head.extra,
                      input,
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      copy,
                      /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                      len
                    );
                  }
                  if (state.flags & 512) {
                    state.check = crc322(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  state.length -= copy;
                }
                if (state.length) {
                  break inf_leave;
                }
              }
              state.length = 0;
              state.mode = NAME2;
            /* falls through */
            case NAME2:
              if (state.flags & 2048) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.name += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc322(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.name = null;
              }
              state.length = 0;
              state.mode = COMMENT2;
            /* falls through */
            case COMMENT2:
              if (state.flags & 4096) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.comment += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc322(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.comment = null;
              }
              state.mode = HCRC2;
            /* falls through */
            case HCRC2:
              if (state.flags & 512) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.check & 65535)) {
                  strm.msg = "header crc mismatch";
                  state.mode = BAD2;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              if (state.head) {
                state.head.hcrc = state.flags >> 9 & 1;
                state.head.done = true;
              }
              strm.adler = state.check = 0;
              state.mode = TYPE2;
              break;
            case DICTID2:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              strm.adler = state.check = zswap322(hold);
              hold = 0;
              bits = 0;
              state.mode = DICT2;
            /* falls through */
            case DICT2:
              if (state.havedict === 0) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                return Z_NEED_DICT2;
              }
              strm.adler = state.check = 1;
              state.mode = TYPE2;
            /* falls through */
            case TYPE2:
              if (flush === Z_BLOCK2 || flush === Z_TREES2) {
                break inf_leave;
              }
            /* falls through */
            case TYPEDO2:
              if (state.last) {
                hold >>>= bits & 7;
                bits -= bits & 7;
                state.mode = CHECK2;
                break;
              }
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.last = hold & 1;
              hold >>>= 1;
              bits -= 1;
              switch (hold & 3) {
                case 0:
                  state.mode = STORED2;
                  break;
                case 1:
                  fixedtables2(state);
                  state.mode = LEN_2;
                  if (flush === Z_TREES2) {
                    hold >>>= 2;
                    bits -= 2;
                    break inf_leave;
                  }
                  break;
                case 2:
                  state.mode = TABLE2;
                  break;
                case 3:
                  strm.msg = "invalid block type";
                  state.mode = BAD2;
              }
              hold >>>= 2;
              bits -= 2;
              break;
            case STORED2:
              hold >>>= bits & 7;
              bits -= bits & 7;
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                strm.msg = "invalid stored block lengths";
                state.mode = BAD2;
                break;
              }
              state.length = hold & 65535;
              hold = 0;
              bits = 0;
              state.mode = COPY_2;
              if (flush === Z_TREES2) {
                break inf_leave;
              }
            /* falls through */
            case COPY_2:
              state.mode = COPY2;
            /* falls through */
            case COPY2:
              copy = state.length;
              if (copy) {
                if (copy > have) {
                  copy = have;
                }
                if (copy > left) {
                  copy = left;
                }
                if (copy === 0) {
                  break inf_leave;
                }
                utils.arraySet(output, input, next, copy, put);
                have -= copy;
                next += copy;
                left -= copy;
                put += copy;
                state.length -= copy;
                break;
              }
              state.mode = TYPE2;
              break;
            case TABLE2:
              while (bits < 14) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.nlen = (hold & 31) + 257;
              hold >>>= 5;
              bits -= 5;
              state.ndist = (hold & 31) + 1;
              hold >>>= 5;
              bits -= 5;
              state.ncode = (hold & 15) + 4;
              hold >>>= 4;
              bits -= 4;
              if (state.nlen > 286 || state.ndist > 30) {
                strm.msg = "too many length or distance symbols";
                state.mode = BAD2;
                break;
              }
              state.have = 0;
              state.mode = LENLENS2;
            /* falls through */
            case LENLENS2:
              while (state.have < state.ncode) {
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.lens[order[state.have++]] = hold & 7;
                hold >>>= 3;
                bits -= 3;
              }
              while (state.have < 19) {
                state.lens[order[state.have++]] = 0;
              }
              state.lencode = state.lendyn;
              state.lenbits = 7;
              opts = { bits: state.lenbits };
              ret = inflate_table2(CODES2, state.lens, 0, 19, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid code lengths set";
                state.mode = BAD2;
                break;
              }
              state.have = 0;
              state.mode = CODELENS2;
            /* falls through */
            case CODELENS2:
              while (state.have < state.nlen + state.ndist) {
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_val < 16) {
                  hold >>>= here_bits;
                  bits -= here_bits;
                  state.lens[state.have++] = here_val;
                } else {
                  if (here_val === 16) {
                    n = here_bits + 2;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    if (state.have === 0) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD2;
                      break;
                    }
                    len = state.lens[state.have - 1];
                    copy = 3 + (hold & 3);
                    hold >>>= 2;
                    bits -= 2;
                  } else if (here_val === 17) {
                    n = here_bits + 3;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 3 + (hold & 7);
                    hold >>>= 3;
                    bits -= 3;
                  } else {
                    n = here_bits + 7;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 11 + (hold & 127);
                    hold >>>= 7;
                    bits -= 7;
                  }
                  if (state.have + copy > state.nlen + state.ndist) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD2;
                    break;
                  }
                  while (copy--) {
                    state.lens[state.have++] = len;
                  }
                }
              }
              if (state.mode === BAD2) {
                break;
              }
              if (state.lens[256] === 0) {
                strm.msg = "invalid code -- missing end-of-block";
                state.mode = BAD2;
                break;
              }
              state.lenbits = 9;
              opts = { bits: state.lenbits };
              ret = inflate_table2(LENS2, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid literal/lengths set";
                state.mode = BAD2;
                break;
              }
              state.distbits = 6;
              state.distcode = state.distdyn;
              opts = { bits: state.distbits };
              ret = inflate_table2(DISTS2, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
              state.distbits = opts.bits;
              if (ret) {
                strm.msg = "invalid distances set";
                state.mode = BAD2;
                break;
              }
              state.mode = LEN_2;
              if (flush === Z_TREES2) {
                break inf_leave;
              }
            /* falls through */
            case LEN_2:
              state.mode = LEN2;
            /* falls through */
            case LEN2:
              if (have >= 6 && left >= 258) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                inflate_fast2(strm, _out);
                put = strm.next_out;
                output = strm.output;
                left = strm.avail_out;
                next = strm.next_in;
                input = strm.input;
                have = strm.avail_in;
                hold = state.hold;
                bits = state.bits;
                if (state.mode === TYPE2) {
                  state.back = -1;
                }
                break;
              }
              state.back = 0;
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_op && (here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              state.length = here_val;
              if (here_op === 0) {
                state.mode = LIT2;
                break;
              }
              if (here_op & 32) {
                state.back = -1;
                state.mode = TYPE2;
                break;
              }
              if (here_op & 64) {
                strm.msg = "invalid literal/length code";
                state.mode = BAD2;
                break;
              }
              state.extra = here_op & 15;
              state.mode = LENEXT2;
            /* falls through */
            case LENEXT2:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              state.was = state.length;
              state.mode = DIST2;
            /* falls through */
            case DIST2:
              for (; ; ) {
                here = state.distcode[hold & (1 << state.distbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              if (here_op & 64) {
                strm.msg = "invalid distance code";
                state.mode = BAD2;
                break;
              }
              state.offset = here_val;
              state.extra = here_op & 15;
              state.mode = DISTEXT2;
            /* falls through */
            case DISTEXT2:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.offset += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              if (state.offset > state.dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD2;
                break;
              }
              state.mode = MATCH2;
            /* falls through */
            case MATCH2:
              if (left === 0) {
                break inf_leave;
              }
              copy = _out - left;
              if (state.offset > copy) {
                copy = state.offset - copy;
                if (copy > state.whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD2;
                    break;
                  }
                }
                if (copy > state.wnext) {
                  copy -= state.wnext;
                  from = state.wsize - copy;
                } else {
                  from = state.wnext - copy;
                }
                if (copy > state.length) {
                  copy = state.length;
                }
                from_source = state.window;
              } else {
                from_source = output;
                from = put - state.offset;
                copy = state.length;
              }
              if (copy > left) {
                copy = left;
              }
              left -= copy;
              state.length -= copy;
              do {
                output[put++] = from_source[from++];
              } while (--copy);
              if (state.length === 0) {
                state.mode = LEN2;
              }
              break;
            case LIT2:
              if (left === 0) {
                break inf_leave;
              }
              output[put++] = state.length;
              left--;
              state.mode = LEN2;
              break;
            case CHECK2:
              if (state.wrap) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold |= input[next++] << bits;
                  bits += 8;
                }
                _out -= left;
                strm.total_out += _out;
                state.total += _out;
                if (_out) {
                  strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                  state.flags ? crc322(state.check, output, _out, put - _out) : adler322(state.check, output, _out, put - _out);
                }
                _out = left;
                if ((state.flags ? hold : zswap322(hold)) !== state.check) {
                  strm.msg = "incorrect data check";
                  state.mode = BAD2;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = LENGTH2;
            /* falls through */
            case LENGTH2:
              if (state.wrap && state.flags) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.total & 4294967295)) {
                  strm.msg = "incorrect length check";
                  state.mode = BAD2;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = DONE2;
            /* falls through */
            case DONE2:
              ret = Z_STREAM_END2;
              break inf_leave;
            case BAD2:
              ret = Z_DATA_ERROR2;
              break inf_leave;
            case MEM2:
              return Z_MEM_ERROR2;
            case SYNC2:
            /* falls through */
            default:
              return Z_STREAM_ERROR2;
          }
        }
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      if (state.wsize || _out !== strm.avail_out && state.mode < BAD2 && (state.mode < CHECK2 || flush !== Z_FINISH2)) {
        if (updatewindow2(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
          state.mode = MEM2;
          return Z_MEM_ERROR2;
        }
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if (state.wrap && _out) {
        strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
        state.flags ? crc322(state.check, output, _out, strm.next_out - _out) : adler322(state.check, output, _out, strm.next_out - _out);
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE2 ? 128 : 0) + (state.mode === LEN_2 || state.mode === COPY_2 ? 256 : 0);
      if ((_in === 0 && _out === 0 || flush === Z_FINISH2) && ret === Z_OK2) {
        ret = Z_BUF_ERROR2;
      }
      return ret;
    }
    function inflateEnd2(strm) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      var state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK2;
    }
    function inflateGetHeader2(strm, head) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      state = strm.state;
      if ((state.wrap & 2) === 0) {
        return Z_STREAM_ERROR2;
      }
      state.head = head;
      head.done = false;
      return Z_OK2;
    }
    function inflateSetDictionary2(strm, dictionary) {
      var dictLength = dictionary.length;
      var state;
      var dictid;
      var ret;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR2;
      }
      state = strm.state;
      if (state.wrap !== 0 && state.mode !== DICT2) {
        return Z_STREAM_ERROR2;
      }
      if (state.mode === DICT2) {
        dictid = 1;
        dictid = adler322(dictid, dictionary, dictLength, 0);
        if (dictid !== state.check) {
          return Z_DATA_ERROR2;
        }
      }
      ret = updatewindow2(strm, dictionary, dictLength, dictLength);
      if (ret) {
        state.mode = MEM2;
        return Z_MEM_ERROR2;
      }
      state.havedict = 1;
      return Z_OK2;
    }
    exports.inflateReset = inflateReset3;
    exports.inflateReset2 = inflateReset22;
    exports.inflateResetKeep = inflateResetKeep2;
    exports.inflateInit = inflateInit3;
    exports.inflateInit2 = inflateInit22;
    exports.inflate = inflate3;
    exports.inflateEnd = inflateEnd2;
    exports.inflateGetHeader = inflateGetHeader2;
    exports.inflateSetDictionary = inflateSetDictionary2;
    exports.inflateInfo = "pako inflate (from Nodeca project)";
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/constants.js
var require_constants = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/constants.js"(exports, module) {
    "use strict";
    module.exports = {
      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH: 0,
      Z_PARTIAL_FLUSH: 1,
      Z_SYNC_FLUSH: 2,
      Z_FULL_FLUSH: 3,
      Z_FINISH: 4,
      Z_BLOCK: 5,
      Z_TREES: 6,
      /* Return codes for the compression/decompression functions. Negative values
      * are errors, positive values are used for special but normal events.
      */
      Z_OK: 0,
      Z_STREAM_END: 1,
      Z_NEED_DICT: 2,
      Z_ERRNO: -1,
      Z_STREAM_ERROR: -2,
      Z_DATA_ERROR: -3,
      //Z_MEM_ERROR:     -4,
      Z_BUF_ERROR: -5,
      //Z_VERSION_ERROR: -6,
      /* compression levels */
      Z_NO_COMPRESSION: 0,
      Z_BEST_SPEED: 1,
      Z_BEST_COMPRESSION: 9,
      Z_DEFAULT_COMPRESSION: -1,
      Z_FILTERED: 1,
      Z_HUFFMAN_ONLY: 2,
      Z_RLE: 3,
      Z_FIXED: 4,
      Z_DEFAULT_STRATEGY: 0,
      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY: 0,
      Z_TEXT: 1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN: 2,
      /* The deflate compression method */
      Z_DEFLATED: 8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/gzheader.js
var require_gzheader = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
    "use strict";
    function GZheader2() {
      this.text = 0;
      this.time = 0;
      this.xflags = 0;
      this.os = 0;
      this.extra = null;
      this.extra_len = 0;
      this.name = "";
      this.comment = "";
      this.hcrc = 0;
      this.done = false;
    }
    module.exports = GZheader2;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/inflate.js
var require_inflate2 = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/inflate.js"(exports) {
    "use strict";
    var zlib_inflate = require_inflate();
    var utils = require_common();
    var strings2 = require_strings();
    var c = require_constants();
    var msg = require_messages();
    var ZStream2 = require_zstream();
    var GZheader2 = require_gzheader();
    var toString2 = Object.prototype.toString;
    function Inflate2(options) {
      if (!(this instanceof Inflate2)) return new Inflate2(options);
      this.options = utils.assign({
        chunkSize: 16384,
        windowBits: 0,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) {
          opt.windowBits = -15;
        }
      }
      if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
        opt.windowBits += 32;
      }
      if (opt.windowBits > 15 && opt.windowBits < 48) {
        if ((opt.windowBits & 15) === 0) {
          opt.windowBits |= 15;
        }
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream2();
      this.strm.avail_out = 0;
      var status2 = zlib_inflate.inflateInit2(
        this.strm,
        opt.windowBits
      );
      if (status2 !== c.Z_OK) {
        throw new Error(msg[status2]);
      }
      this.header = new GZheader2();
      zlib_inflate.inflateGetHeader(this.strm, this.header);
      if (opt.dictionary) {
        if (typeof opt.dictionary === "string") {
          opt.dictionary = strings2.string2buf(opt.dictionary);
        } else if (toString2.call(opt.dictionary) === "[object ArrayBuffer]") {
          opt.dictionary = new Uint8Array(opt.dictionary);
        }
        if (opt.raw) {
          status2 = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
          if (status2 !== c.Z_OK) {
            throw new Error(msg[status2]);
          }
        }
      }
    }
    Inflate2.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var dictionary = this.options.dictionary;
      var status2, _mode;
      var next_out_utf8, tail, utf8str;
      var allowBufError = false;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings2.binstring2buf(data);
      } else if (toString2.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status2 = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
        if (status2 === c.Z_NEED_DICT && dictionary) {
          status2 = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
        }
        if (status2 === c.Z_BUF_ERROR && allowBufError === true) {
          status2 = c.Z_OK;
          allowBufError = false;
        }
        if (status2 !== c.Z_STREAM_END && status2 !== c.Z_OK) {
          this.onEnd(status2);
          this.ended = true;
          return false;
        }
        if (strm.next_out) {
          if (strm.avail_out === 0 || status2 === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              next_out_utf8 = strings2.utf8border(strm.output, strm.next_out);
              tail = strm.next_out - next_out_utf8;
              utf8str = strings2.buf2string(strm.output, next_out_utf8);
              strm.next_out = tail;
              strm.avail_out = chunkSize - tail;
              if (tail) {
                utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
              }
              this.onData(utf8str);
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        }
        if (strm.avail_in === 0 && strm.avail_out === 0) {
          allowBufError = true;
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status2 !== c.Z_STREAM_END);
      if (status2 === c.Z_STREAM_END) {
        _mode = c.Z_FINISH;
      }
      if (_mode === c.Z_FINISH) {
        status2 = zlib_inflate.inflateEnd(this.strm);
        this.onEnd(status2);
        this.ended = true;
        return status2 === c.Z_OK;
      }
      if (_mode === c.Z_SYNC_FLUSH) {
        this.onEnd(c.Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Inflate2.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Inflate2.prototype.onEnd = function(status2) {
      if (status2 === c.Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status2;
      this.msg = this.strm.msg;
    };
    function inflate3(input, options) {
      var inflator = new Inflate2(options);
      inflator.push(input, true);
      if (inflator.err) {
        throw inflator.msg || msg[inflator.err];
      }
      return inflator.result;
    }
    function inflateRaw2(input, options) {
      options = options || {};
      options.raw = true;
      return inflate3(input, options);
    }
    exports.Inflate = Inflate2;
    exports.inflate = inflate3;
    exports.inflateRaw = inflateRaw2;
    exports.ungzip = inflate3;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/index.js
var require_pako = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/pako@1.0.11/node_modules/pako/index.js"(exports, module) {
    "use strict";
    var assign2 = require_common().assign;
    var deflate2 = require_deflate2();
    var inflate3 = require_inflate2();
    var constants2 = require_constants();
    var pako2 = {};
    assign2(pako2, deflate2, inflate3, constants2);
    module.exports = pako2;
  }
});

// ../streaming-pdf-reader/node_modules/.pnpm/utif2@4.1.0/node_modules/utif2/UTIF.js
var require_UTIF = __commonJS({
  "../streaming-pdf-reader/node_modules/.pnpm/utif2@4.1.0/node_modules/utif2/UTIF.js"(exports, module) {
    (function() {
      var UTIF2 = {};
      if (typeof module == "object") {
        module.exports = UTIF2;
      } else {
        self.UTIF = UTIF2;
      }
      var pako2 = typeof __require === "function" ? require_pako() : self.pako;
      function log() {
        if (typeof process == "undefined" || true) console.log.apply(console, arguments);
      }
      (function(UTIF3, pako3) {
        (function() {
          "use strict";
          var W = (function a1() {
            function W2(p) {
              this.message = "JPEG error: " + p;
            }
            W2.prototype = new Error();
            W2.prototype.name = "JpegError";
            W2.constructor = W2;
            return W2;
          })(), ak = (function ag() {
            var p = new Uint8Array([0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63]), t = 4017, ac = 799, ah = 3406, ao = 2276, ar = 1567, ai = 3784, s = 5793, ad = 2896;
            function ak2(Q) {
              if (Q == null) Q = {};
              if (Q.w == null) Q.w = -1;
              this.V = Q.n;
              this.N = Q.w;
            }
            function a5(Q, h) {
              var f = 0, G = [], n, E, a = 16, F;
              while (a > 0 && !Q[a - 1]) {
                a--;
              }
              G.push({ children: [], index: 0 });
              var C = G[0];
              for (n = 0; n < a; n++) {
                for (E = 0; E < Q[n]; E++) {
                  C = G.pop();
                  C.children[C.index] = h[f];
                  while (C.index > 0) {
                    C = G.pop();
                  }
                  C.index++;
                  G.push(C);
                  while (G.length <= n) {
                    G.push(F = { children: [], index: 0 });
                    C.children[C.index] = F.children;
                    C = F;
                  }
                  f++;
                }
                if (n + 1 < a) {
                  G.push(F = { children: [], index: 0 });
                  C.children[C.index] = F.children;
                  C = F;
                }
              }
              return G[0].children;
            }
            function a2(Q, h, f) {
              return 64 * ((Q.P + 1) * h + f);
            }
            function a7(Q, h, f, G, n, E, a, C, F, d) {
              if (d == null) d = false;
              var T = f.m, U = f.Z, z = h, J = 0, V = 0, r = 0, D = 0, a8, q = 0, X, O, _, N, e, K, x = 0, k, g, R, c;
              function Y() {
                if (V > 0) {
                  V--;
                  return J >> V & 1;
                }
                J = Q[h++];
                if (J === 255) {
                  var I = Q[h++];
                  if (I) {
                    if (I === 220 && d) {
                      h += 2;
                      var l = Z(Q, h);
                      h += 2;
                      if (l > 0 && l !== f.s) {
                        throw new DNLMarkerError("Found DNL marker (0xFFDC) while parsing scan data", l);
                      }
                    } else if (I === 217) {
                      if (d) {
                        var M = q * 8;
                        if (M > 0 && M < f.s / 10) {
                          throw new DNLMarkerError("Found EOI marker (0xFFD9) while parsing scan data, possibly caused by incorrect `scanLines` parameter", M);
                        }
                      }
                      throw new EOIMarkerError("Found EOI marker (0xFFD9) while parsing scan data");
                    }
                    throw new W("unexpected marker");
                  }
                }
                V = 7;
                return J >>> 7;
              }
              function u(I) {
                var l = I;
                while (true) {
                  l = l[Y()];
                  switch (typeof l) {
                    case "number":
                      return l;
                    case "object":
                      continue;
                  }
                  throw new W("invalid huffman sequence");
                }
              }
              function m(I) {
                var e2 = 0;
                while (I > 0) {
                  e2 = e2 << 1 | Y();
                  I--;
                }
                return e2;
              }
              function j(I) {
                if (I === 1) {
                  return Y() === 1 ? 1 : -1;
                }
                var e2 = m(I);
                if (e2 >= 1 << I - 1) {
                  return e2;
                }
                return e2 + (-1 << I) + 1;
              }
              function v(X2, I) {
                var l = u(X2.J), M = l === 0 ? 0 : j(l), N2 = 1;
                X2.D[I] = X2.Q += M;
                while (N2 < 64) {
                  var S = u(X2.i), i2 = S & 15, A = S >> 4;
                  if (i2 === 0) {
                    if (A < 15) {
                      break;
                    }
                    N2 += 16;
                    continue;
                  }
                  N2 += A;
                  var o = p[N2];
                  X2.D[I + o] = j(i2);
                  N2++;
                }
              }
              function $(X2, I) {
                var l = u(X2.J), M = l === 0 ? 0 : j(l) << F;
                X2.D[I] = X2.Q += M;
              }
              function b(X2, I) {
                X2.D[I] |= Y() << F;
              }
              function P(X2, I) {
                if (r > 0) {
                  r--;
                  return;
                }
                var N2 = E, l = a;
                while (N2 <= l) {
                  var M = u(X2.i), S = M & 15, i2 = M >> 4;
                  if (S === 0) {
                    if (i2 < 15) {
                      r = m(i2) + (1 << i2) - 1;
                      break;
                    }
                    N2 += 16;
                    continue;
                  }
                  N2 += i2;
                  var A = p[N2];
                  X2.D[I + A] = j(S) * (1 << F);
                  N2++;
                }
              }
              function a4(X2, I) {
                var N2 = E, l = a, M = 0, S, i2;
                while (N2 <= l) {
                  var A = I + p[N2], o = X2.D[A] < 0 ? -1 : 1;
                  switch (D) {
                    case 0:
                      i2 = u(X2.i);
                      S = i2 & 15;
                      M = i2 >> 4;
                      if (S === 0) {
                        if (M < 15) {
                          r = m(M) + (1 << M);
                          D = 4;
                        } else {
                          M = 16;
                          D = 1;
                        }
                      } else {
                        if (S !== 1) {
                          throw new W("invalid ACn encoding");
                        }
                        a8 = j(S);
                        D = M ? 2 : 3;
                      }
                      continue;
                    case 1:
                    case 2:
                      if (X2.D[A]) {
                        X2.D[A] += o * (Y() << F);
                      } else {
                        M--;
                        if (M === 0) {
                          D = D === 2 ? 3 : 0;
                        }
                      }
                      break;
                    case 3:
                      if (X2.D[A]) {
                        X2.D[A] += o * (Y() << F);
                      } else {
                        X2.D[A] = a8 << F;
                        D = 0;
                      }
                      break;
                    case 4:
                      if (X2.D[A]) {
                        X2.D[A] += o * (Y() << F);
                      }
                      break;
                  }
                  N2++;
                }
                if (D === 4) {
                  r--;
                  if (r === 0) {
                    D = 0;
                  }
                }
              }
              function H(X2, I, x2, l, M) {
                var S = x2 / T | 0, i2 = x2 % T;
                q = S * X2.A + l;
                var A = i2 * X2.h + M, o = a2(X2, q, A);
                I(X2, o);
              }
              function w(X2, I, x2) {
                q = x2 / X2.P | 0;
                var l = x2 % X2.P, M = a2(X2, q, l);
                I(X2, M);
              }
              var y = G.length;
              if (U) {
                if (E === 0) {
                  K = C === 0 ? $ : b;
                } else {
                  K = C === 0 ? P : a4;
                }
              } else {
                K = v;
              }
              if (y === 1) {
                g = G[0].P * G[0].c;
              } else {
                g = T * f.R;
              }
              while (x <= g) {
                var L = n ? Math.min(g - x, n) : g;
                if (L > 0) {
                  for (O = 0; O < y; O++) {
                    G[O].Q = 0;
                  }
                  r = 0;
                  if (y === 1) {
                    X = G[0];
                    for (e = 0; e < L; e++) {
                      w(X, K, x);
                      x++;
                    }
                  } else {
                    for (e = 0; e < L; e++) {
                      for (O = 0; O < y; O++) {
                        X = G[O];
                        R = X.h;
                        c = X.A;
                        for (_ = 0; _ < c; _++) {
                          for (N = 0; N < R; N++) {
                            H(X, K, x, _, N);
                          }
                        }
                      }
                      x++;
                    }
                  }
                }
                V = 0;
                k = an(Q, h);
                if (!k) {
                  break;
                }
                if (k.u) {
                  var a6 = L > 0 ? "unexpected" : "excessive";
                  h = k.offset;
                }
                if (k.M >= 65488 && k.M <= 65495) {
                  h += 2;
                } else {
                  break;
                }
              }
              return h - z;
            }
            function al(Q, h, f) {
              var G = Q.$, n = Q.D, E, a, C, F, d, T, U, z, J, V, Y, u, m, j, v, $, b;
              if (!G) {
                throw new W("missing required Quantization Table.");
              }
              for (var r = 0; r < 64; r += 8) {
                J = n[h + r];
                V = n[h + r + 1];
                Y = n[h + r + 2];
                u = n[h + r + 3];
                m = n[h + r + 4];
                j = n[h + r + 5];
                v = n[h + r + 6];
                $ = n[h + r + 7];
                J *= G[r];
                if ((V | Y | u | m | j | v | $) === 0) {
                  b = s * J + 512 >> 10;
                  f[r] = b;
                  f[r + 1] = b;
                  f[r + 2] = b;
                  f[r + 3] = b;
                  f[r + 4] = b;
                  f[r + 5] = b;
                  f[r + 6] = b;
                  f[r + 7] = b;
                  continue;
                }
                V *= G[r + 1];
                Y *= G[r + 2];
                u *= G[r + 3];
                m *= G[r + 4];
                j *= G[r + 5];
                v *= G[r + 6];
                $ *= G[r + 7];
                E = s * J + 128 >> 8;
                a = s * m + 128 >> 8;
                C = Y;
                F = v;
                d = ad * (V - $) + 128 >> 8;
                z = ad * (V + $) + 128 >> 8;
                T = u << 4;
                U = j << 4;
                E = E + a + 1 >> 1;
                a = E - a;
                b = C * ai + F * ar + 128 >> 8;
                C = C * ar - F * ai + 128 >> 8;
                F = b;
                d = d + U + 1 >> 1;
                U = d - U;
                z = z + T + 1 >> 1;
                T = z - T;
                E = E + F + 1 >> 1;
                F = E - F;
                a = a + C + 1 >> 1;
                C = a - C;
                b = d * ao + z * ah + 2048 >> 12;
                d = d * ah - z * ao + 2048 >> 12;
                z = b;
                b = T * ac + U * t + 2048 >> 12;
                T = T * t - U * ac + 2048 >> 12;
                U = b;
                f[r] = E + z;
                f[r + 7] = E - z;
                f[r + 1] = a + U;
                f[r + 6] = a - U;
                f[r + 2] = C + T;
                f[r + 5] = C - T;
                f[r + 3] = F + d;
                f[r + 4] = F - d;
              }
              for (var P = 0; P < 8; ++P) {
                J = f[P];
                V = f[P + 8];
                Y = f[P + 16];
                u = f[P + 24];
                m = f[P + 32];
                j = f[P + 40];
                v = f[P + 48];
                $ = f[P + 56];
                if ((V | Y | u | m | j | v | $) === 0) {
                  b = s * J + 8192 >> 14;
                  if (b < -2040) {
                    b = 0;
                  } else if (b >= 2024) {
                    b = 255;
                  } else {
                    b = b + 2056 >> 4;
                  }
                  n[h + P] = b;
                  n[h + P + 8] = b;
                  n[h + P + 16] = b;
                  n[h + P + 24] = b;
                  n[h + P + 32] = b;
                  n[h + P + 40] = b;
                  n[h + P + 48] = b;
                  n[h + P + 56] = b;
                  continue;
                }
                E = s * J + 2048 >> 12;
                a = s * m + 2048 >> 12;
                C = Y;
                F = v;
                d = ad * (V - $) + 2048 >> 12;
                z = ad * (V + $) + 2048 >> 12;
                T = u;
                U = j;
                E = (E + a + 1 >> 1) + 4112;
                a = E - a;
                b = C * ai + F * ar + 2048 >> 12;
                C = C * ar - F * ai + 2048 >> 12;
                F = b;
                d = d + U + 1 >> 1;
                U = d - U;
                z = z + T + 1 >> 1;
                T = z - T;
                E = E + F + 1 >> 1;
                F = E - F;
                a = a + C + 1 >> 1;
                C = a - C;
                b = d * ao + z * ah + 2048 >> 12;
                d = d * ah - z * ao + 2048 >> 12;
                z = b;
                b = T * ac + U * t + 2048 >> 12;
                T = T * t - U * ac + 2048 >> 12;
                U = b;
                J = E + z;
                $ = E - z;
                V = a + U;
                v = a - U;
                Y = C + T;
                j = C - T;
                u = F + d;
                m = F - d;
                if (J < 16) {
                  J = 0;
                } else if (J >= 4080) {
                  J = 255;
                } else {
                  J >>= 4;
                }
                if (V < 16) {
                  V = 0;
                } else if (V >= 4080) {
                  V = 255;
                } else {
                  V >>= 4;
                }
                if (Y < 16) {
                  Y = 0;
                } else if (Y >= 4080) {
                  Y = 255;
                } else {
                  Y >>= 4;
                }
                if (u < 16) {
                  u = 0;
                } else if (u >= 4080) {
                  u = 255;
                } else {
                  u >>= 4;
                }
                if (m < 16) {
                  m = 0;
                } else if (m >= 4080) {
                  m = 255;
                } else {
                  m >>= 4;
                }
                if (j < 16) {
                  j = 0;
                } else if (j >= 4080) {
                  j = 255;
                } else {
                  j >>= 4;
                }
                if (v < 16) {
                  v = 0;
                } else if (v >= 4080) {
                  v = 255;
                } else {
                  v >>= 4;
                }
                if ($ < 16) {
                  $ = 0;
                } else if ($ >= 4080) {
                  $ = 255;
                } else {
                  $ >>= 4;
                }
                n[h + P] = J;
                n[h + P + 8] = V;
                n[h + P + 16] = Y;
                n[h + P + 24] = u;
                n[h + P + 32] = m;
                n[h + P + 40] = j;
                n[h + P + 48] = v;
                n[h + P + 56] = $;
              }
            }
            function a0(Q, h) {
              var f = h.P, G = h.c, n = new Int16Array(64);
              for (var E = 0; E < G; E++) {
                for (var a = 0; a < f; a++) {
                  var C = a2(h, E, a);
                  al(h, C, n);
                }
              }
              return h.D;
            }
            function an(Q, h, f) {
              if (f == null) f = h;
              var G = Q.length - 1, n = f < h ? f : h;
              if (h >= G) {
                return null;
              }
              var E = Z(Q, h);
              if (E >= 65472 && E <= 65534) {
                return { u: null, M: E, offset: h };
              }
              var a = Z(Q, n);
              while (!(a >= 65472 && a <= 65534)) {
                if (++n >= G) {
                  return null;
                }
                a = Z(Q, n);
              }
              return { u: E.toString(16), M: a, offset: n };
            }
            ak2.prototype = { parse(Q, h) {
              if (h == null) h = {};
              var f = h.F, E = 0, a = null, C = null, F, d, T = 0;
              function G() {
                var o = Z(Q, E);
                E += 2;
                var B = E + o - 2, V2 = an(Q, B, E);
                if (V2 && V2.u) {
                  B = V2.offset;
                }
                var ab = Q.subarray(E, B);
                E += ab.length;
                return ab;
              }
              function n(F2) {
                var o = Math.ceil(F2.o / 8 / F2.X), B = Math.ceil(F2.s / 8 / F2.B);
                for (var Y2 = 0; Y2 < F2.W.length; Y2++) {
                  R = F2.W[Y2];
                  var ab = Math.ceil(Math.ceil(F2.o / 8) * R.h / F2.X), af = Math.ceil(Math.ceil(F2.s / 8) * R.A / F2.B), ap = o * R.h, aq = B * R.A, ae = 64 * aq * (ap + 1);
                  R.D = new Int16Array(ae);
                  R.P = ab;
                  R.c = af;
                }
                F2.m = o;
                F2.R = B;
              }
              var U = [], z = [], J = [], V = Z(Q, E);
              E += 2;
              if (V !== 65496) {
                throw new W("SOI not found");
              }
              V = Z(Q, E);
              E += 2;
              markerLoop: while (V !== 65497) {
                var Y, u, m;
                switch (V) {
                  case 65504:
                  case 65505:
                  case 65506:
                  case 65507:
                  case 65508:
                  case 65509:
                  case 65510:
                  case 65511:
                  case 65512:
                  case 65513:
                  case 65514:
                  case 65515:
                  case 65516:
                  case 65517:
                  case 65518:
                  case 65519:
                  case 65534:
                    var j = G();
                    if (V === 65504) {
                      if (j[0] === 74 && j[1] === 70 && j[2] === 73 && j[3] === 70 && j[4] === 0) {
                        a = { version: { d: j[5], T: j[6] }, K: j[7], j: j[8] << 8 | j[9], H: j[10] << 8 | j[11], S: j[12], I: j[13], C: j.subarray(14, 14 + 3 * j[12] * j[13]) };
                      }
                    }
                    if (V === 65518) {
                      if (j[0] === 65 && j[1] === 100 && j[2] === 111 && j[3] === 98 && j[4] === 101) {
                        C = { version: j[5] << 8 | j[6], k: j[7] << 8 | j[8], q: j[9] << 8 | j[10], a: j[11] };
                      }
                    }
                    break;
                  case 65499:
                    var v = Z(Q, E), b;
                    E += 2;
                    var $ = v + E - 2;
                    while (E < $) {
                      var r = Q[E++], P = new Uint16Array(64);
                      if (r >> 4 === 0) {
                        for (u = 0; u < 64; u++) {
                          b = p[u];
                          P[b] = Q[E++];
                        }
                      } else if (r >> 4 === 1) {
                        for (u = 0; u < 64; u++) {
                          b = p[u];
                          P[b] = Z(Q, E);
                          E += 2;
                        }
                      } else {
                        throw new W("DQT - invalid table spec");
                      }
                      U[r & 15] = P;
                    }
                    break;
                  case 65472:
                  case 65473:
                  case 65474:
                    if (F) {
                      throw new W("Only single frame JPEGs supported");
                    }
                    E += 2;
                    F = {};
                    F.G = V === 65473;
                    F.Z = V === 65474;
                    F.precision = Q[E++];
                    var D = Z(Q, E), a4, q = 0, H = 0;
                    E += 2;
                    F.s = f || D;
                    F.o = Z(Q, E);
                    E += 2;
                    F.W = [];
                    F._ = {};
                    var a8 = Q[E++];
                    for (Y = 0; Y < a8; Y++) {
                      a4 = Q[E];
                      var w = Q[E + 1] >> 4, y = Q[E + 1] & 15;
                      if (q < w) {
                        q = w;
                      }
                      if (H < y) {
                        H = y;
                      }
                      var X = Q[E + 2];
                      m = F.W.push({ h: w, A: y, L: X, $: null });
                      F._[a4] = m - 1;
                      E += 3;
                    }
                    F.X = q;
                    F.B = H;
                    n(F);
                    break;
                  case 65476:
                    var O = Z(Q, E);
                    E += 2;
                    for (Y = 2; Y < O; ) {
                      var _ = Q[E++], N = new Uint8Array(16), e = 0;
                      for (u = 0; u < 16; u++, E++) {
                        e += N[u] = Q[E];
                      }
                      var K = new Uint8Array(e);
                      for (u = 0; u < e; u++, E++) {
                        K[u] = Q[E];
                      }
                      Y += 17 + e;
                      (_ >> 4 === 0 ? J : z)[_ & 15] = a5(N, K);
                    }
                    break;
                  case 65501:
                    E += 2;
                    d = Z(Q, E);
                    E += 2;
                    break;
                  case 65498:
                    var x = ++T === 1 && !f, R;
                    E += 2;
                    var k = Q[E++], g = [];
                    for (Y = 0; Y < k; Y++) {
                      var c = Q[E++], L = F._[c];
                      R = F.W[L];
                      R.index = c;
                      var a6 = Q[E++];
                      R.J = J[a6 >> 4];
                      R.i = z[a6 & 15];
                      g.push(R);
                    }
                    var I = Q[E++], l = Q[E++], M = Q[E++];
                    try {
                      var S = a7(Q, E, F, g, d, I, l, M >> 4, M & 15, x);
                      E += S;
                    } catch (ex) {
                      if (ex instanceof DNLMarkerError) {
                        return this.parse(Q, { F: ex.s });
                      } else if (ex instanceof EOIMarkerError) {
                        break markerLoop;
                      }
                      throw ex;
                    }
                    break;
                  case 65500:
                    E += 4;
                    break;
                  case 65535:
                    if (Q[E] !== 255) {
                      E--;
                    }
                    break;
                  default:
                    var i2 = an(Q, E - 2, E - 3);
                    if (i2 && i2.u) {
                      E = i2.offset;
                      break;
                    }
                    if (E >= Q.length - 1) {
                      break markerLoop;
                    }
                    throw new W("JpegImage.parse - unknown marker: " + V.toString(16));
                }
                V = Z(Q, E);
                E += 2;
              }
              this.width = F.o;
              this.height = F.s;
              this.g = a;
              this.b = C;
              this.W = [];
              for (Y = 0; Y < F.W.length; Y++) {
                R = F.W[Y];
                var A = U[R.L];
                if (A) {
                  R.$ = A;
                }
                this.W.push({ index: R.index, e: a0(F, R), l: R.h / F.X, t: R.A / F.B, P: R.P, c: R.c });
              }
              this.p = this.W.length;
              return void 0;
            }, Y(Q, h, f) {
              if (f == null) f = false;
              var G = this.width / Q, n = this.height / h, E, a, C, F, d, T, U, z, J, V, Y = 0, u, m = this.W.length, j = Q * h * m, v = new Uint8ClampedArray(j), $ = new Uint32Array(Q), b = 4294967288, r;
              for (U = 0; U < m; U++) {
                E = this.W[U];
                a = E.l * G;
                C = E.t * n;
                Y = U;
                u = E.e;
                F = E.P + 1 << 3;
                if (a !== r) {
                  for (d = 0; d < Q; d++) {
                    z = 0 | d * a;
                    $[d] = (z & b) << 3 | z & 7;
                  }
                  r = a;
                }
                for (T = 0; T < h; T++) {
                  z = 0 | T * C;
                  V = F * (z & b) | (z & 7) << 3;
                  for (d = 0; d < Q; d++) {
                    v[Y] = u[V + $[d]];
                    Y += m;
                  }
                }
              }
              var P = this.V;
              if (!f && m === 4 && !P) {
                P = new Int32Array([-256, 255, -256, 255, -256, 255, -256, 255]);
              }
              if (P) {
                for (U = 0; U < j; ) {
                  for (z = 0, J = 0; z < m; z++, U++, J += 2) {
                    v[U] = (v[U] * P[J] >> 8) + P[J + 1];
                  }
                }
              }
              return v;
            }, get f() {
              if (this.b) {
                return !!this.b.a;
              }
              if (this.p === 3) {
                if (this.N === 0) {
                  return false;
                } else if (this.W[0].index === 82 && this.W[1].index === 71 && this.W[2].index === 66) {
                  return false;
                }
                return true;
              }
              if (this.N === 1) {
                return true;
              }
              return false;
            }, z: function aj(Q) {
              var h, f, G;
              for (var n = 0, E = Q.length; n < E; n += 3) {
                h = Q[n];
                f = Q[n + 1];
                G = Q[n + 2];
                Q[n] = h - 179.456 + 1.402 * G;
                Q[n + 1] = h + 135.459 - 0.344 * f - 0.714 * G;
                Q[n + 2] = h - 226.816 + 1.772 * f;
              }
              return Q;
            }, O: function aa(Q) {
              var h, f, G, n, E = 0;
              for (var a = 0, C = Q.length; a < C; a += 4) {
                h = Q[a];
                f = Q[a + 1];
                G = Q[a + 2];
                n = Q[a + 3];
                Q[E++] = -122.67195406894 + f * (-660635669420364e-19 * f + 437130475926232e-18 * G - 54080610064599e-18 * h + 48449797120281e-17 * n - 0.154362151871126) + G * (-957964378445773e-18 * G + 817076911346625e-18 * h - 0.00477271405408747 * n + 1.53380253221734) + h * (961250184130688e-18 * h - 0.00266257332283933 * n + 0.48357088451265) + n * (-336197177618394e-18 * n + 0.484791561490776);
                Q[E++] = 107.268039397724 + f * (219927104525741e-19 * f - 640992018297945e-18 * G + 659397001245577e-18 * h + 426105652938837e-18 * n - 0.176491792462875) + G * (-778269941513683e-18 * G + 0.00130872261408275 * h + 770482631801132e-18 * n - 0.151051492775562) + h * (0.00126935368114843 * h - 0.00265090189010898 * n + 0.25802910206845) + n * (-318913117588328e-18 * n - 0.213742400323665);
                Q[E++] = -20.810012546947 + f * (-570115196973677e-18 * f - 263409051004589e-19 * G + 0.0020741088115012 * h - 0.00288260236853442 * n + 0.814272968359295) + G * (-153496057440975e-19 * G - 132689043961446e-18 * h + 560833691242812e-18 * n - 0.195152027534049) + h * (0.00174418132927582 * h - 0.00255243321439347 * n + 0.116935020465145) + n * (-343531996510555e-18 * n + 0.24165260232407);
              }
              return Q.subarray(0, E);
            }, r: function a3(Q) {
              var h, f, G;
              for (var n = 0, E = Q.length; n < E; n += 4) {
                h = Q[n];
                f = Q[n + 1];
                G = Q[n + 2];
                Q[n] = 434.456 - h - 1.402 * G;
                Q[n + 1] = 119.541 - h + 0.344 * f + 0.714 * G;
                Q[n + 2] = 481.816 - h - 1.772 * f;
              }
              return Q;
            }, U: function as(Q) {
              var h, f, G, n, E = 0;
              for (var a = 0, C = Q.length; a < C; a += 4) {
                h = Q[a];
                f = Q[a + 1];
                G = Q[a + 2];
                n = Q[a + 3];
                Q[E++] = 255 + h * (-6747147073602441e-20 * h + 8379262121013727e-19 * f + 2894718188643294e-19 * G + 0.003264231057537806 * n - 1.1185611867203937) + f * (26374107616089405e-21 * f - 8626949158638572e-20 * G - 2748769067499491e-19 * n - 0.02155688794978967) + G * (-3878099212869363e-20 * G - 3267808279485286e-19 * n + 0.0686742238595345) - n * (3361971776183937e-19 * n + 0.7430659151342254);
                Q[E++] = 255 + h * (13596372813588848e-20 * h + 924537132573585e-18 * f + 10567359618683593e-20 * G + 4791864687436512e-19 * n - 0.3109689587515875) + f * (-23545346108370344e-20 * f + 2702845253534714e-19 * G + 0.0020200308977307156 * n - 0.7488052167015494) + G * (6834815998235662e-20 * G + 15168452363460973e-20 * n - 0.09751927774728933) - n * (3189131175883281e-19 * n + 0.7364883807733168);
                Q[E++] = 255 + h * (13598650411385307e-21 * h + 12423956175490851e-20 * f + 4751985097583589e-19 * G - 36729317476630422e-22 * n - 0.05562186980264034) + f * (16141380598724676e-20 * f + 9692239130725186e-19 * G + 7782692450036253e-19 * n - 0.44015232367526463) + G * (5068882914068769e-22 * G + 0.0017778369011375071 * n - 0.7591454649749609) - n * (3435319965105553e-19 * n + 0.7063770186160144);
              }
              return Q.subarray(0, E);
            }, getData: function(Q) {
              var h = Q.width, f = Q.height, G = Q.forceRGB, n = Q.isSourcePDF;
              if (this.p > 4) {
                throw new W("Unsupported color mode");
              }
              var E = this.Y(h, f, n);
              if (this.p === 1 && G) {
                var a = E.length, C = new Uint8ClampedArray(a * 3), F = 0;
                for (var d = 0; d < a; d++) {
                  var T = E[d];
                  C[F++] = T;
                  C[F++] = T;
                  C[F++] = T;
                }
                return C;
              } else if (this.p === 3 && this.f) {
                return this.z(E);
              } else if (this.p === 4) {
                if (this.f) {
                  if (G) {
                    return this.O(E);
                  }
                  return this.r(E);
                } else if (G) {
                  return this.U(E);
                }
              }
              return E;
            } };
            return ak2;
          })();
          function a9(p, t) {
            return p[t] << 24 >> 24;
          }
          function Z(p, t) {
            return p[t] << 8 | p[t + 1];
          }
          function am(p, t) {
            return (p[t] << 24 | p[t + 1] << 16 | p[t + 2] << 8 | p[t + 3]) >>> 0;
          }
          UTIF3.JpegDecoder = ak;
        })();
        UTIF3.encodeImage = function(rgba, w, h, metadata) {
          var idf = {
            "t256": [w],
            "t257": [h],
            "t258": [8, 8, 8, 8],
            "t259": [1],
            "t262": [2],
            "t273": [1e3],
            // strips offset
            "t277": [4],
            "t278": [h],
            /* rows per strip */
            "t279": [w * h * 4],
            // strip byte counts
            "t282": [[72, 1]],
            "t283": [[72, 1]],
            "t284": [1],
            "t286": [[0, 1]],
            "t287": [[0, 1]],
            "t296": [1],
            "t305": ["Photopea (UTIF.js)"],
            "t338": [1]
          };
          if (metadata) for (var i2 in metadata) idf[i2] = metadata[i2];
          var prfx = new Uint8Array(UTIF3.encode([idf]));
          var img = new Uint8Array(rgba);
          var data = new Uint8Array(1e3 + w * h * 4);
          for (var i2 = 0; i2 < prfx.length; i2++) data[i2] = prfx[i2];
          for (var i2 = 0; i2 < img.length; i2++) data[1e3 + i2] = img[i2];
          return data.buffer;
        };
        UTIF3.encode = function(ifds) {
          var LE = false;
          var data = new Uint8Array(2e4), offset = 4, bin = LE ? UTIF3._binLE : UTIF3._binBE;
          data[0] = data[1] = LE ? 73 : 77;
          bin.writeUshort(data, 2, 42);
          var ifdo = 8;
          bin.writeUint(data, offset, ifdo);
          offset += 4;
          for (var i2 = 0; i2 < ifds.length; i2++) {
            var noffs = UTIF3._writeIFD(bin, UTIF3._types.basic, data, ifdo, ifds[i2]);
            ifdo = noffs[1];
            if (i2 < ifds.length - 1) {
              if ((ifdo & 3) != 0) ifdo += 4 - (ifdo & 3);
              bin.writeUint(data, noffs[0], ifdo);
            }
          }
          return data.slice(0, ifdo).buffer;
        };
        UTIF3.decode = function(buff, prm) {
          if (prm == null) prm = { parseMN: true, debug: false };
          var data = new Uint8Array(buff), offset = 0;
          var id = UTIF3._binBE.readASCII(data, offset, 2);
          offset += 2;
          var bin = id == "II" ? UTIF3._binLE : UTIF3._binBE;
          var num = bin.readUshort(data, offset);
          offset += 2;
          var ifdo = bin.readUint(data, offset);
          offset += 4;
          var ifds = [];
          while (true) {
            var cnt = bin.readUshort(data, ifdo), typ = bin.readUshort(data, ifdo + 4);
            if (cnt != 0) {
              if (typ < 1 || 13 < typ) {
                log("error in TIFF");
                break;
              }
            }
            ;
            UTIF3._readIFD(bin, data, ifdo, ifds, 0, prm);
            ifdo = bin.readUint(data, ifdo + 2 + cnt * 12);
            if (ifdo == 0) break;
          }
          return ifds;
        };
        UTIF3.decodeImage = function(buff, img, ifds) {
          if (img.data) return;
          var data = new Uint8Array(buff);
          var id = UTIF3._binBE.readASCII(data, 0, 2);
          if (img["t256"] == null) return;
          img.isLE = id == "II";
          img.width = img["t256"][0];
          img.height = img["t257"][0];
          var cmpr = img["t259"] ? img["t259"][0] : 1;
          var fo = img["t266"] ? img["t266"][0] : 1;
          if (img["t284"] && img["t284"][0] == 2) log("PlanarConfiguration 2 should not be used!");
          if (cmpr == 7 && img["t258"] && img["t258"].length > 3) img["t258"] = img["t258"].slice(0, 3);
          var spp = img["t277"] ? img["t277"][0] : 1;
          var bps = img["t258"] ? img["t258"][0] : 1;
          var bipp = bps * spp;
          if (cmpr == 1 && img["t279"] != null && img["t278"] && img["t262"][0] == 32803) {
            bipp = Math.round(img["t279"][0] * 8 / (img.width * img["t278"][0]));
          }
          if (img["t50885"] && img["t50885"][0] == 4) bipp = img["t258"][0] * 3;
          var bipl = Math.ceil(img.width * bipp / 8) * 8;
          var soff = img["t273"];
          if (soff == null || img["t322"]) soff = img["t324"];
          var bcnt = img["t279"];
          if (cmpr == 1 && soff.length == 1) bcnt = [img.height * (bipl >>> 3)];
          if (bcnt == null || img["t322"]) bcnt = img["t325"];
          var bytes = new Uint8Array(img.height * (bipl >>> 3)), bilen = 0;
          if (img["t322"] != null) {
            var tw = img["t322"][0], th = img["t323"][0];
            var tx = Math.floor((img.width + tw - 1) / tw);
            var ty = Math.floor((img.height + th - 1) / th);
            var tbuff = new Uint8Array(Math.ceil(tw * th * bipp / 8) | 0);
            console.log("====", tx, ty);
            for (var y = 0; y < ty; y++)
              for (var x = 0; x < tx; x++) {
                var i2 = y * tx + x;
                tbuff.fill(0);
                UTIF3.decode._decompress(img, ifds, data, soff[i2], bcnt[i2], cmpr, tbuff, 0, fo, tw, th);
                if (cmpr == 6) bytes = tbuff;
                else UTIF3._copyTile(tbuff, Math.ceil(tw * bipp / 8) | 0, th, bytes, Math.ceil(img.width * bipp / 8) | 0, img.height, Math.ceil(x * tw * bipp / 8) | 0, y * th);
              }
            bilen = bytes.length * 8;
          } else {
            if (soff == null) return;
            var rps = img["t278"] ? img["t278"][0] : img.height;
            rps = Math.min(rps, img.height);
            for (var i2 = 0; i2 < soff.length; i2++) {
              UTIF3.decode._decompress(img, ifds, data, soff[i2], bcnt[i2], cmpr, bytes, Math.ceil(bilen / 8) | 0, fo, img.width, rps);
              bilen += bipl * rps;
            }
            bilen = Math.min(bilen, bytes.length * 8);
          }
          img.data = new Uint8Array(bytes.buffer, 0, Math.ceil(bilen / 8) | 0);
        };
        UTIF3.decode._decompress = function(img, ifds, data, off, len, cmpr, tgt, toff, fo, w, h) {
          if (img["t271"] && img["t271"][0] == "Panasonic" && img["t45"] && img["t45"][0] == 6) cmpr = 34316;
          if (false) {
          } else if (cmpr == 1) for (var j = 0; j < len; j++) tgt[toff + j] = data[off + j];
          else if (cmpr == 2) UTIF3.decode._decodeG2(data, off, len, tgt, toff, w, fo);
          else if (cmpr == 3) UTIF3.decode._decodeG3(data, off, len, tgt, toff, w, fo, img["t292"] ? (img["t292"][0] & 1) == 1 : false);
          else if (cmpr == 4) UTIF3.decode._decodeG4(data, off, len, tgt, toff, w, fo);
          else if (cmpr == 5) UTIF3.decode._decodeLZW(data, off, len, tgt, toff, 8);
          else if (cmpr == 6) UTIF3.decode._decodeOldJPEG(img, data, off, len, tgt, toff);
          else if (cmpr == 7 || cmpr == 34892) UTIF3.decode._decodeNewJPEG(img, data, off, len, tgt, toff);
          else if (cmpr == 8 || cmpr == 32946) {
            var src = new Uint8Array(data.buffer, off + 2, len - 6);
            var bin = pako3["inflateRaw"](src);
            if (toff + bin.length <= tgt.length) tgt.set(bin, toff);
          } else if (cmpr == 9) UTIF3.decode._decodeVC5(data, off, len, tgt, toff, img["t33422"]);
          else if (cmpr == 32767) UTIF3.decode._decodeARW(img, data, off, len, tgt, toff);
          else if (cmpr == 32773) UTIF3.decode._decodePackBits(data, off, len, tgt, toff);
          else if (cmpr == 32809) UTIF3.decode._decodeThunder(data, off, len, tgt, toff);
          else if (cmpr == 34316) UTIF3.decode._decodePanasonic(img, data, off, len, tgt, toff);
          else if (cmpr == 34713)
            UTIF3.decode._decodeNikon(img, ifds, data, off, len, tgt, toff);
          else if (cmpr == 34676) UTIF3.decode._decodeLogLuv32(img, data, off, len, tgt, toff);
          else log("Unknown compression", cmpr);
          var bps = img["t258"] ? Math.min(32, img["t258"][0]) : 1;
          var noc = img["t277"] ? img["t277"][0] : 1, bpp = bps * noc >>> 3, bpl = Math.ceil(bps * noc * w / 8);
          if (bps == 16 && !img.isLE && img["t33422"] == null)
            for (var y = 0; y < h; y++) {
              var roff = toff + y * bpl;
              for (var x = 1; x < bpl; x += 2) {
                var t = tgt[roff + x];
                tgt[roff + x] = tgt[roff + x - 1];
                tgt[roff + x - 1] = t;
              }
            }
          if (img["t317"] && img["t317"][0] == 2) {
            for (var y = 0; y < h; y++) {
              var ntoff = toff + y * bpl;
              if (bps == 16) for (var j = bpp; j < bpl; j += 2) {
                var nv = (tgt[ntoff + j + 1] << 8 | tgt[ntoff + j]) + (tgt[ntoff + j - bpp + 1] << 8 | tgt[ntoff + j - bpp]);
                tgt[ntoff + j] = nv & 255;
                tgt[ntoff + j + 1] = nv >>> 8 & 255;
              }
              else if (noc == 3) for (var j = 3; j < bpl; j += 3) {
                tgt[ntoff + j] = tgt[ntoff + j] + tgt[ntoff + j - 3] & 255;
                tgt[ntoff + j + 1] = tgt[ntoff + j + 1] + tgt[ntoff + j - 2] & 255;
                tgt[ntoff + j + 2] = tgt[ntoff + j + 2] + tgt[ntoff + j - 1] & 255;
              }
              else for (var j = bpp; j < bpl; j++) tgt[ntoff + j] = tgt[ntoff + j] + tgt[ntoff + j - bpp] & 255;
            }
          }
        };
        UTIF3.decode._decodePanasonic = function(img, data, off, len, tgt, toff) {
          var img_buffer = data.buffer;
          var rawWidth = img["t2"][0];
          var rawHeight = img["t3"][0];
          var bitsPerSample = img["t10"][0];
          var RW2_Format = img["t45"][0];
          var bidx = 0;
          var imageIndex = 0;
          var vpos = 0;
          var byte = 0;
          var arr_a, arr_b;
          var bytes = RW2_Format == 6 ? new Uint32Array(18) : new Uint8Array(16);
          var i2, j, sh, pred = [0, 0], nonz = [0, 0], isOdd, idx = 0, pixel_base;
          var row, col, crow;
          var buffer = new Uint8Array(16384);
          var result = new Uint16Array(tgt.buffer);
          function getDataRaw(bits) {
            if (vpos == 0) {
              var arr_a2 = new Uint8Array(img_buffer, off + imageIndex + 8184, 16384 - 8184);
              var arr_b2 = new Uint8Array(img_buffer, off + imageIndex, 8184);
              buffer.set(arr_a2);
              buffer.set(arr_b2, arr_a2.length);
              imageIndex += 16384;
            }
            if (RW2_Format == 5) {
              for (i2 = 0; i2 < 16; i2++) {
                bytes[i2] = buffer[vpos++];
                vpos &= 16383;
              }
            } else {
              vpos = vpos - bits & 131071;
              byte = vpos >> 3 ^ 16368;
              return (buffer[byte] | buffer[byte + 1] << 8) >> (vpos & 7) & ~(-1 << bits);
            }
          }
          function getBufferDataRW6(i3) {
            return buffer[vpos + 15 - i3];
          }
          function readPageRW6() {
            bytes[0] = getBufferDataRW6(0) << 6 | getBufferDataRW6(1) >> 2;
            bytes[1] = ((getBufferDataRW6(1) & 3) << 12 | getBufferDataRW6(2) << 4 | getBufferDataRW6(3) >> 4) & 16383;
            bytes[2] = getBufferDataRW6(3) >> 2 & 3;
            bytes[3] = (getBufferDataRW6(3) & 3) << 8 | getBufferDataRW6(4);
            bytes[4] = getBufferDataRW6(5) << 2 | getBufferDataRW6(6) >> 6;
            bytes[5] = (getBufferDataRW6(6) & 63) << 4 | getBufferDataRW6(7) >> 4;
            bytes[6] = getBufferDataRW6(7) >> 2 & 3;
            bytes[7] = (getBufferDataRW6(7) & 3) << 8 | getBufferDataRW6(8);
            bytes[8] = getBufferDataRW6(9) << 2 & 1020 | getBufferDataRW6(10) >> 6;
            bytes[9] = (getBufferDataRW6(10) << 4 | getBufferDataRW6(11) >> 4) & 1023;
            bytes[10] = getBufferDataRW6(11) >> 2 & 3;
            bytes[11] = (getBufferDataRW6(11) & 3) << 8 | getBufferDataRW6(12);
            bytes[12] = (getBufferDataRW6(13) << 2 & 1020 | getBufferDataRW6(14) >> 6) & 1023;
            bytes[13] = (getBufferDataRW6(14) << 4 | getBufferDataRW6(15) >> 4) & 1023;
            vpos += 16;
            byte = 0;
          }
          function readPageRw6_bps12() {
            bytes[0] = getBufferDataRW6(0) << 4 | getBufferDataRW6(1) >> 4;
            bytes[1] = ((getBufferDataRW6(1) & 15) << 8 | getBufferDataRW6(2)) & 4095;
            bytes[2] = getBufferDataRW6(3) >> 6 & 3;
            bytes[3] = (getBufferDataRW6(3) & 63) << 2 | getBufferDataRW6(4) >> 6;
            bytes[4] = (getBufferDataRW6(4) & 63) << 2 | getBufferDataRW6(5) >> 6;
            bytes[5] = (getBufferDataRW6(5) & 63) << 2 | getBufferDataRW6(6) >> 6;
            bytes[6] = getBufferDataRW6(6) >> 4 & 3;
            bytes[7] = (getBufferDataRW6(6) & 15) << 4 | getBufferDataRW6(7) >> 4;
            bytes[8] = (getBufferDataRW6(7) & 15) << 4 | getBufferDataRW6(8) >> 4;
            bytes[9] = (getBufferDataRW6(8) & 15) << 4 | getBufferDataRW6(9) >> 4;
            bytes[10] = getBufferDataRW6(9) >> 2 & 3;
            bytes[11] = (getBufferDataRW6(9) & 3) << 6 | getBufferDataRW6(10) >> 2;
            bytes[12] = (getBufferDataRW6(10) & 3) << 6 | getBufferDataRW6(11) >> 2;
            bytes[13] = (getBufferDataRW6(11) & 3) << 6 | getBufferDataRW6(12) >> 2;
            bytes[14] = getBufferDataRW6(12) & 3;
            bytes[15] = getBufferDataRW6(13);
            bytes[16] = getBufferDataRW6(14);
            bytes[17] = getBufferDataRW6(15);
            vpos += 16;
            byte = 0;
          }
          function resetPredNonzeros() {
            pred[0] = 0;
            pred[1] = 0;
            nonz[0] = 0;
            nonz[1] = 0;
          }
          if (RW2_Format == 7) {
            throw RW2_Format;
          } else if (RW2_Format == 6) {
            var is12bit = bitsPerSample == 12, readPageRw6Fn = is12bit ? readPageRw6_bps12 : readPageRW6, pixelsPerBlock = is12bit ? 14 : 11, pixelbase0 = is12bit ? 128 : 512, pixelbase_compare = is12bit ? 2048 : 8192, spix_compare = is12bit ? 16383 : 65535, pixel_mask = is12bit ? 4095 : 16383, blocksperrow = rawWidth / pixelsPerBlock, rowbytes = blocksperrow * 16, bufferSize = is12bit ? 18 : 14;
            for (row = 0; row < rawHeight - 15; row += 16) {
              var rowstoread = Math.min(16, rawHeight - row);
              var readlen = rowbytes * rowstoread;
              buffer = new Uint8Array(img_buffer, off + bidx, readlen);
              vpos = 0;
              bidx += readlen;
              for (crow = 0, col = 0; crow < rowstoread; crow++, col = 0) {
                idx = (row + crow) * rawWidth;
                for (var rblock = 0; rblock < blocksperrow; rblock++) {
                  readPageRw6Fn();
                  resetPredNonzeros();
                  sh = 0;
                  pixel_base = 0;
                  for (i2 = 0; i2 < pixelsPerBlock; i2++) {
                    isOdd = i2 & 1;
                    if (i2 % 3 == 2) {
                      var base = byte < bufferSize ? bytes[byte++] : 0;
                      if (base == 3) base = 4;
                      pixel_base = pixelbase0 << base;
                      sh = 1 << base;
                    }
                    var epixel = byte < bufferSize ? bytes[byte++] : 0;
                    if (pred[isOdd]) {
                      epixel *= sh;
                      if (pixel_base < pixelbase_compare && nonz[isOdd] > pixel_base)
                        epixel += nonz[isOdd] - pixel_base;
                      nonz[isOdd] = epixel;
                    } else {
                      pred[isOdd] = epixel;
                      if (epixel)
                        nonz[isOdd] = epixel;
                      else
                        epixel = nonz[isOdd];
                    }
                    result[idx + col++] = epixel - 15 <= spix_compare ? epixel - 15 & spix_compare : epixel + 2147483633 >> 31 & pixel_mask;
                  }
                }
              }
            }
          } else if (RW2_Format == 5) {
            var blockSize = bitsPerSample == 12 ? 10 : 9;
            for (row = 0; row < rawHeight; row++) {
              for (col = 0; col < rawWidth; col += blockSize) {
                getDataRaw(0);
                if (bitsPerSample == 12) {
                  result[idx++] = ((bytes[1] & 15) << 8) + bytes[0];
                  result[idx++] = 16 * bytes[2] + (bytes[1] >> 4);
                  result[idx++] = ((bytes[4] & 15) << 8) + bytes[3];
                  result[idx++] = 16 * bytes[5] + (bytes[4] >> 4);
                  result[idx++] = ((bytes[7] & 15) << 8) + bytes[6];
                  result[idx++] = 16 * bytes[8] + (bytes[7] >> 4);
                  result[idx++] = ((bytes[10] & 15) << 8) + bytes[9];
                  result[idx++] = 16 * bytes[11] + (bytes[10] >> 4);
                  result[idx++] = ((bytes[13] & 15) << 8) + bytes[12];
                  result[idx++] = 16 * bytes[14] + (bytes[13] >> 4);
                } else if (bitsPerSample == 14) {
                  result[idx++] = bytes[0] + ((bytes[1] & 63) << 8);
                  result[idx++] = (bytes[1] >> 6) + 4 * bytes[2] + ((bytes[3] & 15) << 10);
                  result[idx++] = (bytes[3] >> 4) + 16 * bytes[4] + ((bytes[5] & 3) << 12);
                  result[idx++] = ((bytes[5] & 252) >> 2) + (bytes[6] << 6);
                  result[idx++] = bytes[7] + ((bytes[8] & 63) << 8);
                  result[idx++] = (bytes[8] >> 6) + 4 * bytes[9] + ((bytes[10] & 15) << 10);
                  result[idx++] = (bytes[10] >> 4) + 16 * bytes[11] + ((bytes[12] & 3) << 12);
                  result[idx++] = ((bytes[12] & 252) >> 2) + (bytes[13] << 6);
                  result[idx++] = bytes[14] + ((bytes[15] & 63) << 8);
                }
              }
            }
          } else if (RW2_Format == 4) {
            for (row = 0; row < rawHeight; row++) {
              for (col = 0; col < rawWidth; col++) {
                i2 = col % 14;
                isOdd = i2 & 1;
                if (i2 == 0) resetPredNonzeros();
                if (i2 % 3 == 2)
                  sh = 4 >> 3 - getDataRaw(2);
                if (nonz[isOdd]) {
                  j = getDataRaw(8);
                  if (j != 0) {
                    pred[isOdd] -= 128 << sh;
                    if (pred[isOdd] < 0 || sh == 4)
                      pred[isOdd] &= ~(-1 << sh);
                    pred[isOdd] += j << sh;
                  }
                } else {
                  nonz[isOdd] = getDataRaw(8);
                  if (nonz[isOdd] || i2 > 11)
                    pred[isOdd] = nonz[isOdd] << 4 | getDataRaw(4);
                }
                result[idx++] = pred[col & 1];
              }
            }
          } else throw RW2_Format;
        };
        UTIF3.decode._decodeVC5 = (function() {
          var x = [1, 0, 1, 0, 2, 2, 1, 1, 3, 7, 1, 2, 5, 25, 1, 3, 6, 48, 1, 4, 6, 54, 1, 5, 7, 111, 1, 8, 7, 99, 1, 6, 7, 105, 12, 0, 7, 107, 1, 7, 8, 209, 20, 0, 8, 212, 1, 9, 8, 220, 1, 10, 9, 393, 1, 11, 9, 394, 32, 0, 9, 416, 1, 12, 9, 427, 1, 13, 10, 887, 1, 18, 10, 784, 1, 14, 10, 790, 1, 15, 10, 835, 60, 0, 10, 852, 1, 16, 10, 885, 1, 17, 11, 1571, 1, 19, 11, 1668, 1, 20, 11, 1669, 100, 0, 11, 1707, 1, 21, 11, 1772, 1, 22, 12, 3547, 1, 29, 12, 3164, 1, 24, 12, 3166, 1, 25, 12, 3140, 1, 23, 12, 3413, 1, 26, 12, 3537, 1, 27, 12, 3539, 1, 28, 13, 7093, 1, 35, 13, 6283, 1, 30, 13, 6331, 1, 31, 13, 6335, 180, 0, 13, 6824, 1, 32, 13, 7072, 1, 33, 13, 7077, 320, 0, 13, 7076, 1, 34, 14, 12565, 1, 36, 14, 12661, 1, 37, 14, 12669, 1, 38, 14, 13651, 1, 39, 14, 14184, 1, 40, 15, 28295, 1, 46, 15, 28371, 1, 47, 15, 25320, 1, 42, 15, 25336, 1, 43, 15, 25128, 1, 41, 15, 27300, 1, 44, 15, 28293, 1, 45, 16, 50259, 1, 48, 16, 50643, 1, 49, 16, 50675, 1, 50, 16, 56740, 1, 53, 16, 56584, 1, 51, 16, 56588, 1, 52, 17, 113483, 1, 61, 17, 113482, 1, 60, 17, 101285, 1, 55, 17, 101349, 1, 56, 17, 109205, 1, 57, 17, 109207, 1, 58, 17, 100516, 1, 54, 17, 113171, 1, 59, 18, 202568, 1, 62, 18, 202696, 1, 63, 18, 218408, 1, 64, 18, 218412, 1, 65, 18, 226340, 1, 66, 18, 226356, 1, 67, 18, 226358, 1, 68, 19, 402068, 1, 69, 19, 405138, 1, 70, 19, 405394, 1, 71, 19, 436818, 1, 72, 19, 436826, 1, 73, 19, 452714, 1, 75, 19, 452718, 1, 76, 19, 452682, 1, 74, 20, 804138, 1, 77, 20, 810279, 1, 78, 20, 810790, 1, 79, 20, 873638, 1, 80, 20, 873654, 1, 81, 20, 905366, 1, 82, 20, 905430, 1, 83, 20, 905438, 1, 84, 21, 1608278, 1, 85, 21, 1620557, 1, 86, 21, 1621582, 1, 87, 21, 1621583, 1, 88, 21, 1747310, 1, 89, 21, 1810734, 1, 90, 21, 1810735, 1, 91, 21, 1810863, 1, 92, 21, 1810879, 1, 93, 22, 3621725, 1, 99, 22, 3621757, 1, 100, 22, 3241112, 1, 94, 22, 3494556, 1, 95, 22, 3494557, 1, 96, 22, 3494622, 1, 97, 22, 3494623, 1, 98, 23, 6482227, 1, 102, 23, 6433117, 1, 101, 23, 6989117, 1, 103, 23, 6989119, 1, 105, 23, 6989118, 1, 104, 23, 7243449, 1, 106, 23, 7243512, 1, 107, 24, 13978233, 1, 111, 24, 12964453, 1, 109, 24, 12866232, 1, 108, 24, 14486897, 1, 113, 24, 13978232, 1, 110, 24, 14486896, 1, 112, 24, 14487026, 1, 114, 24, 14487027, 1, 115, 25, 25732598, 1, 225, 25, 25732597, 1, 189, 25, 25732596, 1, 188, 25, 25732595, 1, 203, 25, 25732594, 1, 202, 25, 25732593, 1, 197, 25, 25732592, 1, 207, 25, 25732591, 1, 169, 25, 25732590, 1, 223, 25, 25732589, 1, 159, 25, 25732522, 1, 235, 25, 25732579, 1, 152, 25, 25732575, 1, 192, 25, 25732489, 1, 179, 25, 25732573, 1, 201, 25, 25732472, 1, 172, 25, 25732576, 1, 149, 25, 25732488, 1, 178, 25, 25732566, 1, 120, 25, 25732571, 1, 219, 25, 25732577, 1, 150, 25, 25732487, 1, 127, 25, 25732506, 1, 211, 25, 25732548, 1, 125, 25, 25732588, 1, 158, 25, 25732486, 1, 247, 25, 25732467, 1, 238, 25, 25732508, 1, 163, 25, 25732552, 1, 228, 25, 25732603, 1, 183, 25, 25732513, 1, 217, 25, 25732587, 1, 168, 25, 25732520, 1, 122, 25, 25732484, 1, 128, 25, 25732562, 1, 249, 25, 25732505, 1, 187, 25, 25732504, 1, 186, 25, 25732483, 1, 136, 25, 25928905, 1, 181, 25, 25732560, 1, 255, 25, 25732500, 1, 230, 25, 25732482, 1, 135, 25, 25732555, 1, 233, 25, 25732568, 1, 222, 25, 25732583, 1, 145, 25, 25732481, 1, 134, 25, 25732586, 1, 167, 25, 25732521, 1, 248, 25, 25732518, 1, 209, 25, 25732480, 1, 243, 25, 25732512, 1, 216, 25, 25732509, 1, 164, 25, 25732547, 1, 140, 25, 25732479, 1, 157, 25, 25732544, 1, 239, 25, 25732574, 1, 191, 25, 25732564, 1, 251, 25, 25732478, 1, 156, 25, 25732546, 1, 139, 25, 25732498, 1, 242, 25, 25732557, 1, 133, 25, 25732477, 1, 162, 25, 25732515, 1, 213, 25, 25732584, 1, 165, 25, 25732514, 1, 212, 25, 25732476, 1, 227, 25, 25732494, 1, 198, 25, 25732531, 1, 236, 25, 25732530, 1, 234, 25, 25732529, 1, 117, 25, 25732528, 1, 215, 25, 25732527, 1, 124, 25, 25732526, 1, 123, 25, 25732525, 1, 254, 25, 25732524, 1, 253, 25, 25732523, 1, 148, 25, 25732570, 1, 218, 25, 25732580, 1, 146, 25, 25732581, 1, 147, 25, 25732569, 1, 224, 25, 25732533, 1, 143, 25, 25732540, 1, 184, 25, 25732541, 1, 185, 25, 25732585, 1, 166, 25, 25732556, 1, 132, 25, 25732485, 1, 129, 25, 25732563, 1, 250, 25, 25732578, 1, 151, 25, 25732501, 1, 119, 25, 25732502, 1, 193, 25, 25732536, 1, 176, 25, 25732496, 1, 245, 25, 25732553, 1, 229, 25, 25732516, 1, 206, 25, 25732582, 1, 144, 25, 25732517, 1, 208, 25, 25732558, 1, 137, 25, 25732543, 1, 241, 25, 25732466, 1, 237, 25, 25732507, 1, 190, 25, 25732542, 1, 240, 25, 25732551, 1, 131, 25, 25732554, 1, 232, 25, 25732565, 1, 252, 25, 25732475, 1, 171, 25, 25732493, 1, 205, 25, 25732492, 1, 204, 25, 25732491, 1, 118, 25, 25732490, 1, 214, 25, 25928904, 1, 180, 25, 25732549, 1, 126, 25, 25732602, 1, 182, 25, 25732539, 1, 175, 25, 25732545, 1, 141, 25, 25732559, 1, 138, 25, 25732537, 1, 177, 25, 25732534, 1, 153, 25, 25732503, 1, 194, 25, 25732606, 1, 160, 25, 25732567, 1, 121, 25, 25732538, 1, 174, 25, 25732497, 1, 246, 25, 25732550, 1, 130, 25, 25732572, 1, 200, 25, 25732474, 1, 170, 25, 25732511, 1, 221, 25, 25732601, 1, 196, 25, 25732532, 1, 142, 25, 25732519, 1, 210, 25, 25732495, 1, 199, 25, 25732605, 1, 155, 25, 25732535, 1, 154, 25, 25732499, 1, 244, 25, 25732510, 1, 220, 25, 25732600, 1, 195, 25, 25732607, 1, 161, 25, 25732604, 1, 231, 25, 25732473, 1, 173, 25, 25732599, 1, 226, 26, 51465122, 1, 116, 26, 51465123, 0, 1], o, C, k, P = [3, 3, 3, 3, 2, 2, 2, 1, 1, 1], V = 24576, ar = 16384, H = 8192, az = ar | H;
          function d(t) {
            var E = t[1], h = t[0][E >>> 3] >>> 7 - (E & 7) & 1;
            t[1]++;
            return h;
          }
          function ag(t, E) {
            if (o == null) {
              o = {};
              for (var h = 0; h < x.length; h += 4) o[x[h + 1]] = x.slice(h, h + 4);
            }
            var L = d(t), g = o[L];
            while (g == null) {
              L = L << 1 | d(t);
              g = o[L];
            }
            var n = g[3];
            if (n != 0) n = d(t) == 0 ? n : -n;
            E[0] = g[2];
            E[1] = n;
          }
          function m(t, E) {
            for (var h = 0; h < E; h++) {
              if ((t & 1) == 1) t++;
              t = t >>> 1;
            }
            return t;
          }
          function A(t, E) {
            return t >> E;
          }
          function O(t, E, h, L, g, n) {
            E[h] = A(A(11 * t[g] - 4 * t[g + n] + t[g + n + n] + 4, 3) + t[L], 1);
            E[h + n] = A(A(5 * t[g] + 4 * t[g + n] - t[g + n + n] + 4, 3) - t[L], 1);
          }
          function J(t, E, h, L, g, n) {
            var W = t[g - n] - t[g + n], j = t[g], $ = t[L];
            E[h] = A(A(W + 4, 3) + j + $, 1);
            E[h + n] = A(A(-W + 4, 3) + j - $, 1);
          }
          function y(t, E, h, L, g, n) {
            E[h] = A(A(5 * t[g] + 4 * t[g - n] - t[g - n - n] + 4, 3) + t[L], 1);
            E[h + n] = A(A(11 * t[g] - 4 * t[g - n] + t[g - n - n] + 4, 3) - t[L], 1);
          }
          function q(t) {
            t = t < 0 ? 0 : t > 4095 ? 4095 : t;
            t = k[t] >>> 2;
            return t;
          }
          function av(t, E, h, L, g, n) {
            L = new Uint16Array(L.buffer);
            var W = Date.now(), j = UTIF3._binBE, $ = E + h, r, u, X, I, ax, a3, R, ai, aa, ap, ah, ae, aD, al, i2, aE, T, B;
            E += 4;
            var a5 = n[0] == 1;
            while (E < $) {
              var S = j.readShort(t, E), s = j.readUshort(t, E + 2);
              E += 4;
              if (S == 12) r = s;
              else if (S == 20) u = s;
              else if (S == 21) X = s;
              else if (S == 48) I = s;
              else if (S == 53) ax = s;
              else if (S == 35) a3 = s;
              else if (S == 62) R = s;
              else if (S == 101) ai = s;
              else if (S == 109) aa = s;
              else if (S == 84) ap = s;
              else if (S == 106) ah = s;
              else if (S == 107) ae = s;
              else if (S == 108) aD = s;
              else if (S == 102) al = s;
              else if (S == 104) i2 = s;
              else if (S == 105) aE = s;
              else {
                var F = S < 0 ? -S : S, D = F & 65280, _ = 0;
                if (F & az) {
                  if (F & H) {
                    _ = s & 65535;
                    _ += (F & 255) << 16;
                  } else {
                    _ = s & 65535;
                  }
                }
                if ((F & V) == V) {
                  if (T == null) {
                    T = [];
                    for (var M = 0; M < 4; M++) T[M] = new Int16Array((u >>> 1) * (X >>> 1));
                    B = new Int16Array((u >>> 1) * (X >>> 1));
                    C = new Int16Array(1024);
                    for (var M = 0; M < 1024; M++) {
                      var aG = M - 512, p = Math.abs(aG), r = Math.floor(768 * p * p * p / (255 * 255 * 255)) + p;
                      C[M] = Math.sign(aG) * r;
                    }
                    k = new Uint16Array(4096);
                    var aA = (1 << 16) - 1;
                    for (var M = 0; M < 4096; M++) {
                      var at = M, a1 = aA * (Math.pow(113, at / 4095) - 1) / 112;
                      k[M] = Math.min(a1, aA);
                    }
                  }
                  var w = T[R], v = m(u, 1 + P[I]), N = m(X, 1 + P[I]);
                  if (I == 0) {
                    for (var b = 0; b < N; b++) for (var G = 0; G < v; G++) {
                      var c = E + (b * v + G) * 2;
                      w[b * (u >>> 1) + G] = t[c] << 8 | t[c + 1];
                    }
                  } else {
                    var a7 = [t, E * 8], a4 = [], ay = 0, aw = v * N, f = [0, 0], Q = 0, s = 0;
                    while (ay < aw) {
                      ag(a7, f);
                      Q = f[0];
                      s = f[1];
                      while (Q > 0) {
                        a4[ay++] = s;
                        Q--;
                      }
                    }
                    var l = (I - 1) % 3, aF = l != 1 ? v : 0, a2 = l != 0 ? N : 0;
                    for (var b = 0; b < N; b++) {
                      var af = (b + a2) * (u >>> 1) + aF, au = b * v;
                      for (var G = 0; G < v; G++) w[af + G] = C[a4[au + G] + 512] * ax;
                    }
                    if (l == 2) {
                      var i2 = u >>> 1, an = v * 2, a9 = N * 2;
                      for (var b = 0; b < N; b++) {
                        for (var G = 0; G < an; G++) {
                          var M = b * 2 * i2 + G, a = b * i2 + G, e = N * i2 + a;
                          if (b == 0) O(w, B, M, e, a, i2);
                          else if (b == N - 1) y(w, B, M, e, a, i2);
                          else J(w, B, M, e, a, i2);
                        }
                      }
                      var Z = w;
                      w = B;
                      B = Z;
                      for (var b = 0; b < a9; b++) {
                        for (var G = 0; G < v; G++) {
                          var M = b * i2 + 2 * G, a = b * i2 + G, e = v + a;
                          if (G == 0) O(w, B, M, e, a, 1);
                          else if (G == v - 1) y(w, B, M, e, a, 1);
                          else J(w, B, M, e, a, 1);
                        }
                      }
                      var Z = w;
                      w = B;
                      B = Z;
                      var aC = [], aB = 2 - ~~((I - 1) / 3);
                      for (var K = 0; K < 3; K++) aC[K] = aa >> 14 - K * 2 & 3;
                      var a6 = aC[aB];
                      if (a6 != 0) for (var b = 0; b < a9; b++) for (var G = 0; G < an; G++) {
                        var M = b * i2 + G;
                        w[M] = w[M] << a6;
                      }
                    }
                  }
                  if (I == 9 && R == 3) {
                    var a8 = T[0], ab = T[1], aq = T[2], as = T[3];
                    for (var b = 0; b < X; b += 2) for (var G = 0; G < u; G += 2) {
                      var U = b * u + G, c = (b >>> 1) * (u >>> 1) + (G >>> 1), z = a8[c], ao = ab[c] - 2048, ak = aq[c] - 2048, ad = as[c] - 2048, aj = (ao << 1) + z, a0 = (ak << 1) + z, aH = z + ad, am = z - ad;
                      if (a5) {
                        L[U] = q(aH);
                        L[U + 1] = q(a0);
                        L[U + u] = q(aj);
                        L[U + u + 1] = q(am);
                      } else {
                        L[U] = q(aj);
                        L[U + 1] = q(aH);
                        L[U + u] = q(am);
                        L[U + u + 1] = q(a0);
                      }
                    }
                  }
                  E += _ * 4;
                } else if (F == 16388) {
                  E += _ * 4;
                } else if (D == 8192 || D == 8448 || D == 9216) {
                } else throw F.toString(16);
              }
            }
            console.log(Date.now() - W);
          }
          return av;
        })();
        UTIF3.decode._decodeLogLuv32 = function(img, data, off, len, tgt, toff) {
          var w = img.width, qw = w * 4;
          var io = 0, out = new Uint8Array(qw);
          while (io < len) {
            var oo = 0;
            while (oo < qw) {
              var c = data[off + io];
              io++;
              if (c < 128) {
                for (var j = 0; j < c; j++) out[oo + j] = data[off + io + j];
                oo += c;
                io += c;
              } else {
                c = c - 126;
                for (var j = 0; j < c; j++) out[oo + j] = data[off + io];
                oo += c;
                io++;
              }
            }
            for (var x = 0; x < w; x++) {
              tgt[toff + 0] = out[x];
              tgt[toff + 1] = out[x + w];
              tgt[toff + 2] = out[x + w * 2];
              tgt[toff + 4] = out[x + w * 3];
              toff += 6;
            }
          }
        };
        UTIF3.decode._ljpeg_diff = function(data, prm, huff) {
          var getbithuff = UTIF3.decode._getbithuff;
          var len, diff;
          len = getbithuff(data, prm, huff[0], huff);
          diff = getbithuff(data, prm, len, 0);
          if ((diff & 1 << len - 1) == 0) diff -= (1 << len) - 1;
          return diff;
        };
        UTIF3.decode._decodeARW = function(img, inp, off, src_length, tgt, toff) {
          var raw_width = img["t256"][0], height = img["t257"][0], tiff_bps = img["t258"][0];
          var bin = img.isLE ? UTIF3._binLE : UTIF3._binBE;
          var arw2 = raw_width * height == src_length || raw_width * height * 1.5 == src_length;
          if (!arw2) {
            height += 8;
            var prm = [off, 0, 0, 0];
            var huff = new Uint16Array(32770);
            var tab = [
              3857,
              3856,
              3599,
              3342,
              3085,
              2828,
              2571,
              2314,
              2057,
              1800,
              1543,
              1286,
              1029,
              772,
              771,
              768,
              514,
              513
            ];
            var i2, c, n, col, row, sum = 0;
            var ljpeg_diff = UTIF3.decode._ljpeg_diff;
            huff[0] = 15;
            for (n = i2 = 0; i2 < 18; i2++) {
              var lim = 32768 >>> (tab[i2] >>> 8);
              for (var c = 0; c < lim; c++) huff[++n] = tab[i2];
            }
            for (col = raw_width; col--; )
              for (row = 0; row < height + 1; row += 2) {
                if (row == height) row = 1;
                sum += ljpeg_diff(inp, prm, huff);
                if (row < height) {
                  var clr = sum & 4095;
                  UTIF3.decode._putsF(tgt, (row * raw_width + col) * tiff_bps, clr << 16 - tiff_bps);
                }
              }
            return;
          }
          if (raw_width * height * 1.5 == src_length) {
            for (var i2 = 0; i2 < src_length; i2 += 3) {
              var b0 = inp[off + i2 + 0], b1 = inp[off + i2 + 1], b2 = inp[off + i2 + 2];
              tgt[toff + i2] = b1 << 4 | b0 >>> 4;
              tgt[toff + i2 + 1] = b0 << 4 | b2 >>> 4;
              tgt[toff + i2 + 2] = b2 << 4 | b1 >>> 4;
            }
            return;
          }
          var pix = new Uint16Array(16);
          var row, col, val, max, min, imax, imin, sh, bit, i2, dp;
          var data = new Uint8Array(raw_width + 1);
          for (row = 0; row < height; row++) {
            for (var j = 0; j < raw_width; j++) data[j] = inp[off++];
            for (dp = 0, col = 0; col < raw_width - 30; dp += 16) {
              max = 2047 & (val = bin.readUint(data, dp));
              min = 2047 & val >>> 11;
              imax = 15 & val >>> 22;
              imin = 15 & val >>> 26;
              for (sh = 0; sh < 4 && 128 << sh <= max - min; sh++) ;
              for (bit = 30, i2 = 0; i2 < 16; i2++)
                if (i2 == imax) pix[i2] = max;
                else if (i2 == imin) pix[i2] = min;
                else {
                  pix[i2] = ((bin.readUshort(data, dp + (bit >> 3)) >>> (bit & 7) & 127) << sh) + min;
                  if (pix[i2] > 2047) pix[i2] = 2047;
                  bit += 7;
                }
              for (i2 = 0; i2 < 16; i2++, col += 2) {
                var clr = pix[i2] << 1;
                UTIF3.decode._putsF(tgt, (row * raw_width + col) * tiff_bps, clr << 16 - tiff_bps);
              }
              col -= col & 1 ? 1 : 31;
            }
          }
        };
        UTIF3.decode._decodeNikon = function(img, imgs, data, off, src_length, tgt, toff) {
          var nikon_tree = [
            [
              0,
              0,
              1,
              5,
              1,
              1,
              1,
              1,
              1,
              1,
              2,
              0,
              0,
              0,
              0,
              0,
              0,
              /* 12-bit lossy */
              5,
              4,
              3,
              6,
              2,
              7,
              1,
              0,
              8,
              9,
              11,
              10,
              12
            ],
            [
              0,
              0,
              1,
              5,
              1,
              1,
              1,
              1,
              1,
              1,
              2,
              0,
              0,
              0,
              0,
              0,
              0,
              /* 12-bit lossy after split */
              57,
              90,
              56,
              39,
              22,
              5,
              4,
              3,
              2,
              1,
              0,
              11,
              12,
              12
            ],
            [
              0,
              0,
              1,
              4,
              2,
              3,
              1,
              2,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              /* 12-bit lossless */
              5,
              4,
              6,
              3,
              7,
              2,
              8,
              1,
              9,
              0,
              10,
              11,
              12
            ],
            [
              0,
              0,
              1,
              4,
              3,
              1,
              1,
              1,
              1,
              1,
              2,
              0,
              0,
              0,
              0,
              0,
              0,
              /* 14-bit lossy */
              5,
              6,
              4,
              7,
              8,
              3,
              9,
              2,
              1,
              0,
              10,
              11,
              12,
              13,
              14
            ],
            [
              0,
              0,
              1,
              5,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              2,
              0,
              0,
              0,
              0,
              0,
              /* 14-bit lossy after split */
              8,
              92,
              75,
              58,
              41,
              7,
              6,
              5,
              4,
              3,
              2,
              1,
              0,
              13,
              14
            ],
            [
              0,
              0,
              1,
              4,
              2,
              2,
              3,
              1,
              2,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              /* 14-bit lossless */
              7,
              6,
              8,
              5,
              9,
              4,
              10,
              3,
              11,
              12,
              2,
              0,
              1,
              13,
              14
            ]
          ];
          var raw_width = img["t256"][0], height = img["t257"][0], tiff_bps = img["t258"][0];
          var tree = 0, split = 0;
          var make_decoder = UTIF3.decode._make_decoder;
          var getbithuff = UTIF3.decode._getbithuff;
          var mn = imgs[0].exifIFD.makerNote, md = mn["t150"] ? mn["t150"] : mn["t140"], mdo = 0;
          var ver0 = md[mdo++], ver1 = md[mdo++];
          if (ver0 == 73 || ver1 == 88) mdo += 2110;
          if (ver0 == 70) tree = 2;
          if (tiff_bps == 14) tree += 3;
          var vpred = [[0, 0], [0, 0]], bin = img.isLE ? UTIF3._binLE : UTIF3._binBE;
          for (var i2 = 0; i2 < 2; i2++) for (var j = 0; j < 2; j++) {
            vpred[i2][j] = bin.readShort(md, mdo);
            mdo += 2;
          }
          var max = 1 << tiff_bps & 32767, step = 0;
          var csize = bin.readShort(md, mdo);
          mdo += 2;
          if (csize > 1) step = Math.floor(max / (csize - 1));
          if (ver0 == 68 && ver1 == 32 && step > 0) split = bin.readShort(md, 562);
          var i2;
          var row, col;
          var len, shl, diff;
          var min_v = 0;
          var hpred = [0, 0];
          var huff = make_decoder(nikon_tree[tree]);
          var prm = [off, 0, 0, 0];
          for (min_v = row = 0; row < height; row++) {
            if (split && row == split) {
              huff = make_decoder(nikon_tree[tree + 1]);
            }
            for (col = 0; col < raw_width; col++) {
              i2 = getbithuff(data, prm, huff[0], huff);
              len = i2 & 15;
              shl = i2 >>> 4;
              diff = (getbithuff(data, prm, len - shl, 0) << 1) + 1 << shl >>> 1;
              if ((diff & 1 << len - 1) == 0)
                diff -= (1 << len) - (shl == 0 ? 1 : 0);
              if (col < 2) hpred[col] = vpred[row & 1][col] += diff;
              else hpred[col & 1] += diff;
              var clr = Math.min(Math.max(hpred[col & 1], 0), (1 << tiff_bps) - 1);
              var bti = (row * raw_width + col) * tiff_bps;
              UTIF3.decode._putsF(tgt, bti, clr << 16 - tiff_bps);
            }
          }
        };
        UTIF3.decode._putsF = function(dt, pos, val) {
          val = val << 8 - (pos & 7);
          var o = pos >>> 3;
          dt[o] |= val >>> 16;
          dt[o + 1] |= val >>> 8;
          dt[o + 2] |= val;
        };
        UTIF3.decode._getbithuff = function(data, prm, nbits, huff) {
          var zero_after_ff = 0;
          var get_byte = UTIF3.decode._get_byte;
          var c;
          var off = prm[0], bitbuf = prm[1], vbits = prm[2], reset = prm[3];
          if (nbits == 0 || vbits < 0) return 0;
          while (!reset && vbits < nbits && (c = data[off++]) != -1 && !(reset = zero_after_ff && c == 255 && data[off++])) {
            bitbuf = (bitbuf << 8) + c;
            vbits += 8;
          }
          c = bitbuf << 32 - vbits >>> 32 - nbits;
          if (huff) {
            vbits -= huff[c + 1] >>> 8;
            c = huff[c + 1] & 255;
          } else
            vbits -= nbits;
          if (vbits < 0) throw "e";
          prm[0] = off;
          prm[1] = bitbuf;
          prm[2] = vbits;
          prm[3] = reset;
          return c;
        };
        UTIF3.decode._make_decoder = function(source) {
          var max, len, h, i2, j;
          var huff = [];
          for (max = 16; max != 0 && !source[max]; max--) ;
          var si = 17;
          huff[0] = max;
          for (h = len = 1; len <= max; len++)
            for (i2 = 0; i2 < source[len]; i2++, ++si)
              for (j = 0; j < 1 << max - len; j++)
                if (h <= 1 << max)
                  huff[h++] = len << 8 | source[si];
          return huff;
        };
        UTIF3.decode._decodeNewJPEG = function(img, data, off, len, tgt, toff) {
          len = Math.min(len, data.length - off);
          var tables = img["t347"], tlen = tables ? tables.length : 0, buff = new Uint8Array(tlen + len);
          if (tables) {
            var SOI = 216, EOI2 = 217, boff = 0;
            for (var i2 = 0; i2 < tlen - 1; i2++) {
              if (tables[i2] == 255 && tables[i2 + 1] == EOI2) break;
              buff[boff++] = tables[i2];
            }
            var byte1 = data[off], byte2 = data[off + 1];
            if (byte1 != 255 || byte2 != SOI) {
              buff[boff++] = byte1;
              buff[boff++] = byte2;
            }
            for (var i2 = 2; i2 < len; i2++) buff[boff++] = data[off + i2];
          } else for (var i2 = 0; i2 < len; i2++) buff[i2] = data[off + i2];
          if (img["t262"][0] == 32803 || img["t259"][0] == 7 && img["t262"][0] == 34892) {
            var bps = img["t258"][0];
            var out = UTIF3.LosslessJpegDecode(buff), olen = out.length;
            if (false) {
            } else if (bps == 16) {
              if (img.isLE) for (var i2 = 0; i2 < olen; i2++) {
                tgt[toff + (i2 << 1)] = out[i2] & 255;
                tgt[toff + (i2 << 1) + 1] = out[i2] >>> 8;
              }
              else for (var i2 = 0; i2 < olen; i2++) {
                tgt[toff + (i2 << 1)] = out[i2] >>> 8;
                tgt[toff + (i2 << 1) + 1] = out[i2] & 255;
              }
            } else if (bps == 14 || bps == 12 || bps == 10) {
              var rst = 16 - bps;
              for (var i2 = 0; i2 < olen; i2++) UTIF3.decode._putsF(tgt, i2 * bps, out[i2] << rst);
            } else if (bps == 8) {
              for (var i2 = 0; i2 < olen; i2++) tgt[toff + i2] = out[i2];
            } else throw new Error("unsupported bit depth " + bps);
          } else {
            var parser = new UTIF3.JpegDecoder();
            parser.parse(buff);
            var decoded = parser.getData({ "width": parser.width, "height": parser.height, "forceRGB": true, "isSourcePDF": false });
            for (var i2 = 0; i2 < decoded.length; i2++) tgt[toff + i2] = decoded[i2];
          }
          if (img["t262"][0] == 6) img["t262"][0] = 2;
        };
        UTIF3.decode._decodeOldJPEGInit = function(img, data, off, len) {
          var SOI = 216, EOI2 = 217, DQT = 219, DHT = 196, DRI = 221, SOF0 = 192, SOS2 = 218;
          var joff = 0, soff = 0, tables, sosMarker2, isTiled = false, i2, j, k;
          var jpgIchgFmt = img["t513"], jifoff = jpgIchgFmt ? jpgIchgFmt[0] : 0;
          var jpgIchgFmtLen = img["t514"], jiflen = jpgIchgFmtLen ? jpgIchgFmtLen[0] : 0;
          var soffTag = img["t324"] || img["t273"] || jpgIchgFmt;
          var ycbcrss = img["t530"], ssx = 0, ssy = 0;
          var spp = img["t277"] ? img["t277"][0] : 1;
          var jpgresint = img["t515"];
          if (soffTag) {
            soff = soffTag[0];
            isTiled = soffTag.length > 1;
          }
          if (!isTiled) {
            if (data[off] == 255 && data[off + 1] == SOI) return { jpegOffset: off };
            if (jpgIchgFmt != null) {
              if (data[off + jifoff] == 255 && data[off + jifoff + 1] == SOI) joff = off + jifoff;
              else log("JPEGInterchangeFormat does not point to SOI");
              if (jpgIchgFmtLen == null) log("JPEGInterchangeFormatLength field is missing");
              else if (jifoff >= soff || jifoff + jiflen <= soff) log("JPEGInterchangeFormatLength field value is invalid");
              if (joff != null) return { jpegOffset: joff };
            }
          }
          if (ycbcrss != null) {
            ssx = ycbcrss[0];
            ssy = ycbcrss[1];
          }
          if (jpgIchgFmt != null) {
            if (jpgIchgFmtLen != null)
              if (jiflen >= 2 && jifoff + jiflen <= soff) {
                if (data[off + jifoff + jiflen - 2] == 255 && data[off + jifoff + jiflen - 1] == SOI) tables = new Uint8Array(jiflen - 2);
                else tables = new Uint8Array(jiflen);
                for (i2 = 0; i2 < tables.length; i2++) tables[i2] = data[off + jifoff + i2];
                log("Incorrect JPEG interchange format: using JPEGInterchangeFormat offset to derive tables");
              } else log("JPEGInterchangeFormat+JPEGInterchangeFormatLength > offset to first strip or tile");
          }
          if (tables == null) {
            var ooff = 0, out = [];
            out[ooff++] = 255;
            out[ooff++] = SOI;
            var qtables = img["t519"];
            if (qtables == null) throw new Error("JPEGQTables tag is missing");
            for (i2 = 0; i2 < qtables.length; i2++) {
              out[ooff++] = 255;
              out[ooff++] = DQT;
              out[ooff++] = 0;
              out[ooff++] = 67;
              out[ooff++] = i2;
              for (j = 0; j < 64; j++) out[ooff++] = data[off + qtables[i2] + j];
            }
            for (k = 0; k < 2; k++) {
              var htables = img[k == 0 ? "t520" : "t521"];
              if (htables == null) throw new Error((k == 0 ? "JPEGDCTables" : "JPEGACTables") + " tag is missing");
              for (i2 = 0; i2 < htables.length; i2++) {
                out[ooff++] = 255;
                out[ooff++] = DHT;
                var nc = 19;
                for (j = 0; j < 16; j++) nc += data[off + htables[i2] + j];
                out[ooff++] = nc >>> 8;
                out[ooff++] = nc & 255;
                out[ooff++] = i2 | k << 4;
                for (j = 0; j < 16; j++) out[ooff++] = data[off + htables[i2] + j];
                for (j = 0; j < nc; j++) out[ooff++] = data[off + htables[i2] + 16 + j];
              }
            }
            out[ooff++] = 255;
            out[ooff++] = SOF0;
            out[ooff++] = 0;
            out[ooff++] = 8 + 3 * spp;
            out[ooff++] = 8;
            out[ooff++] = img.height >>> 8 & 255;
            out[ooff++] = img.height & 255;
            out[ooff++] = img.width >>> 8 & 255;
            out[ooff++] = img.width & 255;
            out[ooff++] = spp;
            if (spp == 1) {
              out[ooff++] = 1;
              out[ooff++] = 17;
              out[ooff++] = 0;
            } else for (i2 = 0; i2 < 3; i2++) {
              out[ooff++] = i2 + 1;
              out[ooff++] = i2 != 0 ? 17 : (ssx & 15) << 4 | ssy & 15;
              out[ooff++] = i2;
            }
            if (jpgresint != null && jpgresint[0] != 0) {
              out[ooff++] = 255;
              out[ooff++] = DRI;
              out[ooff++] = 0;
              out[ooff++] = 4;
              out[ooff++] = jpgresint[0] >>> 8 & 255;
              out[ooff++] = jpgresint[0] & 255;
            }
            tables = new Uint8Array(out);
          }
          var sofpos = -1;
          i2 = 0;
          while (i2 < tables.length - 1) {
            if (tables[i2] == 255 && tables[i2 + 1] == SOF0) {
              sofpos = i2;
              break;
            }
            i2++;
          }
          if (sofpos == -1) {
            var tmptab = new Uint8Array(tables.length + 10 + 3 * spp);
            tmptab.set(tables);
            var tmpoff = tables.length;
            sofpos = tables.length;
            tables = tmptab;
            tables[tmpoff++] = 255;
            tables[tmpoff++] = SOF0;
            tables[tmpoff++] = 0;
            tables[tmpoff++] = 8 + 3 * spp;
            tables[tmpoff++] = 8;
            tables[tmpoff++] = img.height >>> 8 & 255;
            tables[tmpoff++] = img.height & 255;
            tables[tmpoff++] = img.width >>> 8 & 255;
            tables[tmpoff++] = img.width & 255;
            tables[tmpoff++] = spp;
            if (spp == 1) {
              tables[tmpoff++] = 1;
              tables[tmpoff++] = 17;
              tables[tmpoff++] = 0;
            } else for (i2 = 0; i2 < 3; i2++) {
              tables[tmpoff++] = i2 + 1;
              tables[tmpoff++] = i2 != 0 ? 17 : (ssx & 15) << 4 | ssy & 15;
              tables[tmpoff++] = i2;
            }
          }
          if (data[soff] == 255 && data[soff + 1] == SOS2) {
            var soslen = data[soff + 2] << 8 | data[soff + 3];
            sosMarker2 = new Uint8Array(soslen + 2);
            sosMarker2[0] = data[soff];
            sosMarker2[1] = data[soff + 1];
            sosMarker2[2] = data[soff + 2];
            sosMarker2[3] = data[soff + 3];
            for (i2 = 0; i2 < soslen - 2; i2++) sosMarker2[i2 + 4] = data[soff + i2 + 4];
          } else {
            sosMarker2 = new Uint8Array(2 + 6 + 2 * spp);
            var sosoff = 0;
            sosMarker2[sosoff++] = 255;
            sosMarker2[sosoff++] = SOS2;
            sosMarker2[sosoff++] = 0;
            sosMarker2[sosoff++] = 6 + 2 * spp;
            sosMarker2[sosoff++] = spp;
            if (spp == 1) {
              sosMarker2[sosoff++] = 1;
              sosMarker2[sosoff++] = 0;
            } else for (i2 = 0; i2 < 3; i2++) {
              sosMarker2[sosoff++] = i2 + 1;
              sosMarker2[sosoff++] = i2 << 4 | i2;
            }
            sosMarker2[sosoff++] = 0;
            sosMarker2[sosoff++] = 63;
            sosMarker2[sosoff++] = 0;
          }
          return { jpegOffset: off, tables, sosMarker: sosMarker2, sofPosition: sofpos };
        };
        UTIF3.decode._decodeOldJPEG = function(img, data, off, len, tgt, toff) {
          var i2, dlen, tlen, buff, buffoff;
          var jpegData = UTIF3.decode._decodeOldJPEGInit(img, data, off, len);
          if (jpegData.jpegOffset != null) {
            dlen = off + len - jpegData.jpegOffset;
            buff = new Uint8Array(dlen);
            for (i2 = 0; i2 < dlen; i2++) buff[i2] = data[jpegData.jpegOffset + i2];
          } else {
            tlen = jpegData.tables.length;
            buff = new Uint8Array(tlen + jpegData.sosMarker.length + len + 2);
            buff.set(jpegData.tables);
            buffoff = tlen;
            buff[jpegData.sofPosition + 5] = img.height >>> 8 & 255;
            buff[jpegData.sofPosition + 6] = img.height & 255;
            buff[jpegData.sofPosition + 7] = img.width >>> 8 & 255;
            buff[jpegData.sofPosition + 8] = img.width & 255;
            if (data[off] != 255 || data[off + 1] != SOS) {
              buff.set(jpegData.sosMarker, buffoff);
              buffoff += sosMarker.length;
            }
            for (i2 = 0; i2 < len; i2++) buff[buffoff++] = data[off + i2];
            buff[buffoff++] = 255;
            buff[buffoff++] = EOI;
          }
          var parser = new UTIF3.JpegDecoder();
          parser.parse(buff);
          var decoded = parser.getData({ "width": parser.width, "height": parser.height, "forceRGB": true, "isSourcePDF": false });
          for (var i2 = 0; i2 < decoded.length; i2++) tgt[toff + i2] = decoded[i2];
          if (img["t262"] && img["t262"][0] == 6) img["t262"][0] = 2;
        };
        UTIF3.decode._decodePackBits = function(data, off, len, tgt, toff) {
          var sa = new Int8Array(data.buffer), ta = new Int8Array(tgt.buffer), lim = off + len;
          while (off < lim) {
            var n = sa[off];
            off++;
            if (n >= 0 && n < 128) for (var i2 = 0; i2 < n + 1; i2++) {
              ta[toff] = sa[off];
              toff++;
              off++;
            }
            if (n >= -127 && n < 0) {
              for (var i2 = 0; i2 < -n + 1; i2++) {
                ta[toff] = sa[off];
                toff++;
              }
              off++;
            }
          }
          return toff;
        };
        UTIF3.decode._decodeThunder = function(data, off, len, tgt, toff) {
          var d2 = [0, 1, 0, -1], d3 = [0, 1, 2, 3, 0, -3, -2, -1];
          var lim = off + len, qoff = toff * 2, px = 0;
          while (off < lim) {
            var b = data[off], msk = b >>> 6, n = b & 63;
            off++;
            if (msk == 3) {
              px = n & 15;
              tgt[qoff >>> 1] |= px << 4 * (1 - qoff & 1);
              qoff++;
            }
            if (msk == 0) for (var i2 = 0; i2 < n; i2++) {
              tgt[qoff >>> 1] |= px << 4 * (1 - qoff & 1);
              qoff++;
            }
            if (msk == 2) for (var i2 = 0; i2 < 2; i2++) {
              var d = n >>> 3 * (1 - i2) & 7;
              if (d != 4) {
                px += d3[d];
                tgt[qoff >>> 1] |= px << 4 * (1 - qoff & 1);
                qoff++;
              }
            }
            if (msk == 1) for (var i2 = 0; i2 < 3; i2++) {
              var d = n >>> 2 * (2 - i2) & 3;
              if (d != 2) {
                px += d2[d];
                tgt[qoff >>> 1] |= px << 4 * (1 - qoff & 1);
                qoff++;
              }
            }
          }
        };
        UTIF3.decode._dmap = { "1": 0, "011": 1, "000011": 2, "0000011": 3, "010": -1, "000010": -2, "0000010": -3 };
        UTIF3.decode._lens = (function() {
          var addKeys = function(lens, arr, i0, inc) {
            for (var i2 = 0; i2 < arr.length; i2++) lens[arr[i2]] = i0 + i2 * inc;
          };
          var termW = "00110101,000111,0111,1000,1011,1100,1110,1111,10011,10100,00111,01000,001000,000011,110100,110101,101010,101011,0100111,0001100,0001000,0010111,0000011,0000100,0101000,0101011,0010011,0100100,0011000,00000010,00000011,00011010,00011011,00010010,00010011,00010100,00010101,00010110,00010111,00101000,00101001,00101010,00101011,00101100,00101101,00000100,00000101,00001010,00001011,01010010,01010011,01010100,01010101,00100100,00100101,01011000,01011001,01011010,01011011,01001010,01001011,00110010,00110011,00110100";
          var termB = "0000110111,010,11,10,011,0011,0010,00011,000101,000100,0000100,0000101,0000111,00000100,00000111,000011000,0000010111,0000011000,0000001000,00001100111,00001101000,00001101100,00000110111,00000101000,00000010111,00000011000,000011001010,000011001011,000011001100,000011001101,000001101000,000001101001,000001101010,000001101011,000011010010,000011010011,000011010100,000011010101,000011010110,000011010111,000001101100,000001101101,000011011010,000011011011,000001010100,000001010101,000001010110,000001010111,000001100100,000001100101,000001010010,000001010011,000000100100,000000110111,000000111000,000000100111,000000101000,000001011000,000001011001,000000101011,000000101100,000001011010,000001100110,000001100111";
          var makeW = "11011,10010,010111,0110111,00110110,00110111,01100100,01100101,01101000,01100111,011001100,011001101,011010010,011010011,011010100,011010101,011010110,011010111,011011000,011011001,011011010,011011011,010011000,010011001,010011010,011000,010011011";
          var makeB = "0000001111,000011001000,000011001001,000001011011,000000110011,000000110100,000000110101,0000001101100,0000001101101,0000001001010,0000001001011,0000001001100,0000001001101,0000001110010,0000001110011,0000001110100,0000001110101,0000001110110,0000001110111,0000001010010,0000001010011,0000001010100,0000001010101,0000001011010,0000001011011,0000001100100,0000001100101";
          var makeA = "00000001000,00000001100,00000001101,000000010010,000000010011,000000010100,000000010101,000000010110,000000010111,000000011100,000000011101,000000011110,000000011111";
          termW = termW.split(",");
          termB = termB.split(",");
          makeW = makeW.split(",");
          makeB = makeB.split(",");
          makeA = makeA.split(",");
          var lensW = {}, lensB = {};
          addKeys(lensW, termW, 0, 1);
          addKeys(lensW, makeW, 64, 64);
          addKeys(lensW, makeA, 1792, 64);
          addKeys(lensB, termB, 0, 1);
          addKeys(lensB, makeB, 64, 64);
          addKeys(lensB, makeA, 1792, 64);
          return [lensW, lensB];
        })();
        UTIF3.decode._decodeG4 = function(data, off, slen, tgt, toff, w, fo) {
          var U = UTIF3.decode, boff = off << 3, len = 0, wrd = "";
          var line = [], pline = [];
          for (var i2 = 0; i2 < w; i2++) pline.push(0);
          pline = U._makeDiff(pline);
          var a0 = 0, a1 = 0, a2 = 0, b1 = 0, b2 = 0, clr = 0;
          var y = 0, mode = "", toRead = 0;
          var bipl = Math.ceil(w / 8) * 8;
          while (boff >>> 3 < off + slen) {
            b1 = U._findDiff(pline, a0 + (a0 == 0 ? 0 : 1), 1 - clr), b2 = U._findDiff(pline, b1, clr);
            var bit = 0;
            if (fo == 1) bit = data[boff >>> 3] >>> 7 - (boff & 7) & 1;
            if (fo == 2) bit = data[boff >>> 3] >>> (boff & 7) & 1;
            boff++;
            wrd += bit;
            if (mode == "H") {
              if (U._lens[clr][wrd] != null) {
                var dl = U._lens[clr][wrd];
                wrd = "";
                len += dl;
                if (dl < 64) {
                  U._addNtimes(line, len, clr);
                  a0 += len;
                  clr = 1 - clr;
                  len = 0;
                  toRead--;
                  if (toRead == 0) mode = "";
                }
              }
            } else {
              if (wrd == "0001") {
                wrd = "";
                U._addNtimes(line, b2 - a0, clr);
                a0 = b2;
              }
              if (wrd == "001") {
                wrd = "";
                mode = "H";
                toRead = 2;
              }
              if (U._dmap[wrd] != null) {
                a1 = b1 + U._dmap[wrd];
                U._addNtimes(line, a1 - a0, clr);
                a0 = a1;
                wrd = "";
                clr = 1 - clr;
              }
            }
            if (line.length == w && mode == "") {
              U._writeBits(line, tgt, toff * 8 + y * bipl);
              clr = 0;
              y++;
              a0 = 0;
              pline = U._makeDiff(line);
              line = [];
            }
          }
        };
        UTIF3.decode._findDiff = function(line, x, clr) {
          for (var i2 = 0; i2 < line.length; i2 += 2) if (line[i2] >= x && line[i2 + 1] == clr) return line[i2];
        };
        UTIF3.decode._makeDiff = function(line) {
          var out = [];
          if (line[0] == 1) out.push(0, 1);
          for (var i2 = 1; i2 < line.length; i2++) if (line[i2 - 1] != line[i2]) out.push(i2, line[i2]);
          out.push(line.length, 0, line.length, 1);
          return out;
        };
        UTIF3.decode._decodeG2 = function(data, off, slen, tgt, toff, w, fo) {
          var U = UTIF3.decode, boff = off << 3, len = 0, wrd = "";
          var line = [];
          var clr = 0;
          var y = 0;
          var bipl = Math.ceil(w / 8) * 8;
          while (boff >>> 3 < off + slen) {
            var bit = 0;
            if (fo == 1) bit = data[boff >>> 3] >>> 7 - (boff & 7) & 1;
            if (fo == 2) bit = data[boff >>> 3] >>> (boff & 7) & 1;
            boff++;
            wrd += bit;
            len = U._lens[clr][wrd];
            if (len != null) {
              U._addNtimes(line, len, clr);
              wrd = "";
              if (len < 64) clr = 1 - clr;
              if (line.length == w) {
                U._writeBits(line, tgt, toff * 8 + y * bipl);
                line = [];
                y++;
                clr = 0;
                if ((boff & 7) != 0) boff += 8 - (boff & 7);
                if (len >= 64) boff += 8;
              }
            }
          }
        };
        UTIF3.decode._decodeG3 = function(data, off, slen, tgt, toff, w, fo, twoDim) {
          var U = UTIF3.decode, boff = off << 3, len = 0, wrd = "";
          var line = [], pline = [];
          for (var i2 = 0; i2 < w; i2++) line.push(0);
          var a0 = 0, a1 = 0, a2 = 0, b1 = 0, b2 = 0, clr = 0;
          var y = -1, mode = "", toRead = 0, is1D = true;
          var bipl = Math.ceil(w / 8) * 8;
          while (boff >>> 3 < off + slen) {
            b1 = U._findDiff(pline, a0 + (a0 == 0 ? 0 : 1), 1 - clr), b2 = U._findDiff(pline, b1, clr);
            var bit = 0;
            if (fo == 1) bit = data[boff >>> 3] >>> 7 - (boff & 7) & 1;
            if (fo == 2) bit = data[boff >>> 3] >>> (boff & 7) & 1;
            boff++;
            wrd += bit;
            if (is1D) {
              if (U._lens[clr][wrd] != null) {
                var dl = U._lens[clr][wrd];
                wrd = "";
                len += dl;
                if (dl < 64) {
                  U._addNtimes(line, len, clr);
                  clr = 1 - clr;
                  len = 0;
                }
              }
            } else {
              if (mode == "H") {
                if (U._lens[clr][wrd] != null) {
                  var dl = U._lens[clr][wrd];
                  wrd = "";
                  len += dl;
                  if (dl < 64) {
                    U._addNtimes(line, len, clr);
                    a0 += len;
                    clr = 1 - clr;
                    len = 0;
                    toRead--;
                    if (toRead == 0) mode = "";
                  }
                }
              } else {
                if (wrd == "0001") {
                  wrd = "";
                  U._addNtimes(line, b2 - a0, clr);
                  a0 = b2;
                }
                if (wrd == "001") {
                  wrd = "";
                  mode = "H";
                  toRead = 2;
                }
                if (U._dmap[wrd] != null) {
                  a1 = b1 + U._dmap[wrd];
                  U._addNtimes(line, a1 - a0, clr);
                  a0 = a1;
                  wrd = "";
                  clr = 1 - clr;
                }
              }
            }
            if (wrd.endsWith("000000000001")) {
              if (y >= 0) U._writeBits(line, tgt, toff * 8 + y * bipl);
              if (twoDim) {
                if (fo == 1) is1D = (data[boff >>> 3] >>> 7 - (boff & 7) & 1) == 1;
                if (fo == 2) is1D = (data[boff >>> 3] >>> (boff & 7) & 1) == 1;
                boff++;
              }
              wrd = "";
              clr = 0;
              y++;
              a0 = 0;
              pline = U._makeDiff(line);
              line = [];
            }
          }
          if (line.length == w) U._writeBits(line, tgt, toff * 8 + y * bipl);
        };
        UTIF3.decode._addNtimes = function(arr, n, val) {
          for (var i2 = 0; i2 < n; i2++) arr.push(val);
        };
        UTIF3.decode._writeBits = function(bits, tgt, boff) {
          for (var i2 = 0; i2 < bits.length; i2++) tgt[boff + i2 >>> 3] |= bits[i2] << 7 - (boff + i2 & 7);
        };
        UTIF3.decode._decodeLZW = UTIF3.decode._decodeLZW = (function() {
          var e, U, Z, u, K = 0, V = 0, g = 0, N = 0, O = function() {
            var S = e >>> 3, A = U[S] << 16 | U[S + 1] << 8 | U[S + 2], j = A >>> 24 - (e & 7) - V & (1 << V) - 1;
            e += V;
            return j;
          }, h = new Uint32Array(4096 * 4), w = 0, m = function(S) {
            if (S == w) return;
            w = S;
            g = 1 << S;
            N = g + 1;
            for (var A = 0; A < N + 1; A++) {
              h[4 * A] = h[4 * A + 3] = A;
              h[4 * A + 1] = 65535;
              h[4 * A + 2] = 1;
            }
          }, i2 = function(S) {
            V = S + 1;
            K = N + 1;
          }, D = function(S) {
            var A = S << 2, j = h[A + 2], a = u + j - 1;
            while (A != 65535) {
              Z[a--] = h[A];
              A = h[A + 1];
            }
            u += j;
          }, L = function(S, A) {
            var j = K << 2, a = S << 2;
            h[j] = h[(A << 2) + 3];
            h[j + 1] = a;
            h[j + 2] = h[a + 2] + 1;
            h[j + 3] = h[a + 3];
            K++;
            if (K + 1 == 1 << V && V != 12) V++;
          }, T = function(S, A, j, a, n, q) {
            e = A << 3;
            U = S;
            Z = a;
            u = n;
            var B = A + j << 3, _ = 0, t = 0;
            m(q);
            i2(q);
            while (e < B && (_ = O()) != N) {
              if (_ == g) {
                i2(q);
                _ = O();
                if (_ == N) break;
                D(_);
              } else {
                if (_ < K) {
                  D(_);
                  L(t, _);
                } else {
                  L(t, t);
                  D(K - 1);
                }
              }
              t = _;
            }
            return u;
          };
          return T;
        })();
        UTIF3.tags = {};
        UTIF3._types = (function() {
          var main = new Array(250);
          main.fill(0);
          main = main.concat([0, 0, 0, 0, 4, 3, 3, 3, 3, 3, 0, 0, 3, 0, 0, 0, 3, 0, 0, 2, 2, 2, 2, 4, 3, 0, 0, 3, 4, 4, 3, 3, 5, 5, 3, 2, 5, 5, 0, 0, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 5, 5, 3, 0, 3, 3, 4, 4, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          var rest = { 33432: 2, 33434: 5, 33437: 5, 34665: 4, 34850: 3, 34853: 4, 34855: 3, 34864: 3, 34866: 4, 36864: 7, 36867: 2, 36868: 2, 37121: 7, 37377: 10, 37378: 5, 37380: 10, 37381: 5, 37383: 3, 37384: 3, 37385: 3, 37386: 5, 37510: 7, 37520: 2, 37521: 2, 37522: 2, 40960: 7, 40961: 3, 40962: 4, 40963: 4, 40965: 4, 41486: 5, 41487: 5, 41488: 3, 41985: 3, 41986: 3, 41987: 3, 41988: 5, 41989: 3, 41990: 3, 41993: 3, 41994: 3, 41995: 7, 41996: 3, 42032: 2, 42033: 2, 42034: 5, 42036: 2, 42037: 2, 59932: 7 };
          return {
            basic: {
              main,
              rest
            },
            gps: {
              main: [1, 2, 5, 2, 5, 1, 5, 5, 0, 9],
              rest: { 18: 2, 29: 2 }
            }
          };
        })();
        UTIF3._readIFD = function(bin, data, offset, ifds, depth, prm) {
          var cnt = bin.readUshort(data, offset);
          offset += 2;
          var ifd = {};
          if (prm.debug) log("   ".repeat(depth), ifds.length - 1, ">>>----------------");
          for (var i2 = 0; i2 < cnt; i2++) {
            var tag = bin.readUshort(data, offset);
            offset += 2;
            var type = bin.readUshort(data, offset);
            offset += 2;
            var num = bin.readUint(data, offset);
            offset += 4;
            var voff = bin.readUint(data, offset);
            offset += 4;
            var arr = [];
            if (type == 1 || type == 7) {
              var no = num < 5 ? offset - 4 : voff;
              if (no + num > data.buffer.byteLength) num = data.buffer.byteLength - no;
              arr = new Uint8Array(data.buffer, no, num);
            }
            if (type == 2) {
              var o0 = num < 5 ? offset - 4 : voff, c = data[o0], len = Math.max(0, Math.min(num - 1, data.length - o0));
              if (c < 128 || len == 0) arr.push(bin.readASCII(data, o0, len));
              else arr = new Uint8Array(data.buffer, o0, len);
            }
            if (type == 3) {
              for (var j = 0; j < num; j++) arr.push(bin.readUshort(data, (num < 3 ? offset - 4 : voff) + 2 * j));
            }
            if (type == 4 || type == 13) {
              for (var j = 0; j < num; j++) arr.push(bin.readUint(data, (num < 2 ? offset - 4 : voff) + 4 * j));
            }
            if (type == 5 || type == 10) {
              var ri = type == 5 ? bin.readUint : bin.readInt;
              for (var j = 0; j < num; j++) arr.push([ri(data, voff + j * 8), ri(data, voff + j * 8 + 4)]);
            }
            if (type == 8) {
              for (var j = 0; j < num; j++) arr.push(bin.readShort(data, (num < 3 ? offset - 4 : voff) + 2 * j));
            }
            if (type == 9) {
              for (var j = 0; j < num; j++) arr.push(bin.readInt(data, (num < 2 ? offset - 4 : voff) + 4 * j));
            }
            if (type == 11) {
              for (var j = 0; j < num; j++) arr.push(bin.readFloat(data, voff + j * 4));
            }
            if (type == 12) {
              for (var j = 0; j < num; j++) arr.push(bin.readDouble(data, voff + j * 8));
            }
            if (num != 0 && arr.length == 0) {
              log(tag, "unknown TIFF tag type: ", type, "num:", num);
              if (i2 == 0) return;
              continue;
            }
            if (prm.debug) log("   ".repeat(depth), tag, type, UTIF3.tags[tag], arr);
            ifd["t" + tag] = arr;
            if (tag == 330 && ifd["t272"] && ifd["t272"][0] == "DSLR-A100") {
            } else if (tag == 330 || tag == 34665 || tag == 34853 || tag == 50740 && bin.readUshort(data, bin.readUint(arr, 0)) < 300 || tag == 61440) {
              var oarr = tag == 50740 ? [bin.readUint(arr, 0)] : arr;
              var subfd = [];
              for (var j = 0; j < oarr.length; j++) UTIF3._readIFD(bin, data, oarr[j], subfd, depth + 1, prm);
              if (tag == 330) ifd.subIFD = subfd;
              if (tag == 34665) ifd.exifIFD = subfd[0];
              if (tag == 34853) ifd.gpsiIFD = subfd[0];
              if (tag == 50740) ifd.dngPrvt = subfd[0];
              if (tag == 61440) ifd.fujiIFD = subfd[0];
            }
            if (tag == 37500 && prm.parseMN) {
              var mn = arr;
              if (bin.readASCII(mn, 0, 5) == "Nikon") ifd.makerNote = UTIF3["decode"](mn.slice(10).buffer)[0];
              else if (bin.readASCII(mn, 0, 5) == "OLYMP" || bin.readASCII(mn, 0, 9) == "OM SYSTEM") {
                var inds = [8208, 8224, 8240, 8256, 8272];
                var subsub = [];
                UTIF3._readIFD(bin, mn, mn[1] == 77 ? 16 : mn[5] == 85 ? 12 : 8, subsub, depth + 1, prm);
                var obj = ifd.makerNote = subsub.pop();
                for (var j = 0; j < inds.length; j++) {
                  var k = "t" + inds[j];
                  if (obj[k] == null) continue;
                  UTIF3._readIFD(bin, mn, obj[k][0], subsub, depth + 1, prm);
                  obj[k] = subsub.pop();
                }
                if (obj["t12288"]) {
                  UTIF3._readIFD(bin, obj["t12288"], 0, subsub, depth + 1, prm);
                  obj["t12288"] = subsub.pop();
                }
              } else if (bin.readUshort(data, voff) < 300 && bin.readUshort(data, voff + 4) <= 12) {
                var subsub = [];
                UTIF3._readIFD(bin, data, voff, subsub, depth + 1, prm);
                ifd.makerNote = subsub[0];
              }
            }
          }
          ifds.push(ifd);
          if (prm.debug) log("   ".repeat(depth), "<<<---------------");
          return offset;
        };
        UTIF3._writeIFD = function(bin, types, data, offset, ifd) {
          var keys = Object.keys(ifd), knum = keys.length;
          if (ifd["exifIFD"]) knum--;
          if (ifd["gpsiIFD"]) knum--;
          bin.writeUshort(data, offset, knum);
          offset += 2;
          var eoff = offset + knum * 12 + 4;
          for (var ki = 0; ki < keys.length; ki++) {
            var key = keys[ki];
            if (key == "t34665" || key == "t34853") continue;
            if (key == "exifIFD") key = "t34665";
            if (key == "gpsiIFD") key = "t34853";
            var tag = parseInt(key.slice(1)), type = types.main[tag];
            if (type == null) type = types.rest[tag];
            if (type == null || type == 0) throw new Error("unknown type of tag: " + tag);
            var val = ifd[key];
            if (tag == 34665) {
              var outp = UTIF3._writeIFD(bin, types, data, eoff, ifd["exifIFD"]);
              val = [eoff];
              eoff = outp[1];
            }
            if (tag == 34853) {
              var outp = UTIF3._writeIFD(bin, UTIF3._types.gps, data, eoff, ifd["gpsiIFD"]);
              val = [eoff];
              eoff = outp[1];
            }
            if (type == 2) val = val[0] + "\0";
            var num = val.length;
            bin.writeUshort(data, offset, tag);
            offset += 2;
            bin.writeUshort(data, offset, type);
            offset += 2;
            bin.writeUint(data, offset, num);
            offset += 4;
            var dlen = [-1, 1, 1, 2, 4, 8, 0, 1, 0, 4, 8, 0, 8][type] * num;
            var toff = offset;
            if (dlen > 4) {
              bin.writeUint(data, offset, eoff);
              toff = eoff;
            }
            if (type == 1 || type == 7) {
              for (var i2 = 0; i2 < num; i2++) data[toff + i2] = val[i2];
            } else if (type == 2) {
              bin.writeASCII(data, toff, val);
            } else if (type == 3) {
              for (var i2 = 0; i2 < num; i2++) bin.writeUshort(data, toff + 2 * i2, val[i2]);
            } else if (type == 4) {
              for (var i2 = 0; i2 < num; i2++) bin.writeUint(data, toff + 4 * i2, val[i2]);
            } else if (type == 5 || type == 10) {
              var wr = type == 5 ? bin.writeUint : bin.writeInt;
              for (var i2 = 0; i2 < num; i2++) {
                var v = val[i2], nu = v[0], de = v[1];
                if (nu == null) throw "e";
                wr(data, toff + 8 * i2, nu);
                wr(data, toff + 8 * i2 + 4, de);
              }
            } else if (type == 9) {
              for (var i2 = 0; i2 < num; i2++) bin.writeInt(data, toff + 4 * i2, val[i2]);
            } else if (type == 12) {
              for (var i2 = 0; i2 < num; i2++) bin.writeDouble(data, toff + 8 * i2, val[i2]);
            } else throw type;
            if (dlen > 4) {
              dlen += dlen & 1;
              eoff += dlen;
            }
            offset += 4;
          }
          return [offset, eoff];
        };
        UTIF3.toRGBA8 = function(out, scl) {
          function gamma(x2) {
            return x2 < 31308e-7 ? 12.92 * x2 : 1.055 * Math.pow(x2, 1 / 2.4) - 0.055;
          }
          var w = out.width, h = out.height, area = w * h, qarea = area * 4, data = out.data;
          var img = new Uint8Array(area * 4);
          var intp = out["t262"] ? out["t262"][0] : 2, bps = out["t258"] ? Math.min(32, out["t258"][0]) : 1;
          if (out["t262"] == null && bps == 1) intp = 0;
          var smpls = out["t277"] ? out["t277"][0] : out["t258"] ? out["t258"].length : [1, 1, 3, 1, 1, 4, 3][intp];
          var sfmt = out["t339"] ? out["t339"][0] : null;
          if (intp == 1 && bps == 32 && sfmt != 3) throw "e";
          var bpl = Math.ceil(smpls * bps * w / 8);
          if (false) {
          } else if (intp == 0) {
            scl = 1 / 256;
            for (var y = 0; y < h; y++) {
              var off = y * bpl, io = y * w;
              if (bps == 1) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, px = data[off + (i2 >> 3)] >> 7 - (i2 & 7) & 1;
                img[qi] = img[qi + 1] = img[qi + 2] = (1 - px) * 255;
                img[qi + 3] = 255;
              }
              if (bps == 4) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, px = data[off + (i2 >> 1)] >> 4 - 4 * (i2 & 1) & 15;
                img[qi] = img[qi + 1] = img[qi + 2] = (15 - px) * 17;
                img[qi + 3] = 255;
              }
              if (bps == 8) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, px = data[off + i2];
                img[qi] = img[qi + 1] = img[qi + 2] = 255 - px;
                img[qi + 3] = 255;
              }
              if (bps == 16) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, o = off + 2 * i2, px = data[o + 1] << 8 | data[o];
                img[qi] = img[qi + 1] = img[qi + 2] = Math.min(255, 255 - ~~(px * scl));
                img[qi + 3] = 255;
              }
            }
          } else if (intp == 1) {
            if (scl == null) scl = 1 / 256;
            var f32 = (data.length & 3) == 0 ? new Float32Array(data.buffer) : null;
            for (var y = 0; y < h; y++) {
              var off = y * bpl, io = y * w;
              if (bps == 1) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, px = data[off + (i2 >> 3)] >> 7 - (i2 & 7) & 1;
                img[qi] = img[qi + 1] = img[qi + 2] = px * 255;
                img[qi + 3] = 255;
              }
              if (bps == 2) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, px = data[off + (i2 >> 2)] >> 6 - 2 * (i2 & 3) & 3;
                img[qi] = img[qi + 1] = img[qi + 2] = px * 85;
                img[qi + 3] = 255;
              }
              if (bps == 8) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, px = data[off + i2 * smpls];
                img[qi] = img[qi + 1] = img[qi + 2] = px;
                img[qi + 3] = 255;
              }
              if (bps == 16) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, o = off + 2 * i2, px = data[o + 1] << 8 | data[o];
                img[qi] = img[qi + 1] = img[qi + 2] = Math.min(255, ~~(px * scl));
                img[qi + 3] = 255;
              }
              if (bps == 32) for (var i2 = 0; i2 < w; i2++) {
                var qi = io + i2 << 2, o = (off >>> 2) + i2, px = f32[o];
                img[qi] = img[qi + 1] = img[qi + 2] = ~~(0.5 + 255 * px);
                img[qi + 3] = 255;
              }
            }
          } else if (intp == 2) {
            if (bps == 8) {
              if (smpls == 1) for (var i2 = 0; i2 < area; i2++) {
                img[4 * i2] = img[4 * i2 + 1] = img[4 * i2 + 2] = data[i2];
                img[4 * i2 + 3] = 255;
              }
              if (smpls == 3) for (var i2 = 0; i2 < area; i2++) {
                var qi = i2 << 2, ti = i2 * 3;
                img[qi] = data[ti];
                img[qi + 1] = data[ti + 1];
                img[qi + 2] = data[ti + 2];
                img[qi + 3] = 255;
              }
              if (smpls >= 4) for (var i2 = 0; i2 < area; i2++) {
                var qi = i2 << 2, ti = i2 * smpls;
                img[qi] = data[ti];
                img[qi + 1] = data[ti + 1];
                img[qi + 2] = data[ti + 2];
                img[qi + 3] = data[ti + 3];
              }
            } else if (bps == 16) {
              if (smpls == 4) for (var i2 = 0; i2 < area; i2++) {
                var qi = i2 << 2, ti = i2 * 8 + 1;
                img[qi] = data[ti];
                img[qi + 1] = data[ti + 2];
                img[qi + 2] = data[ti + 4];
                img[qi + 3] = data[ti + 6];
              }
              if (smpls == 3) for (var i2 = 0; i2 < area; i2++) {
                var qi = i2 << 2, ti = i2 * 6 + 1;
                img[qi] = data[ti];
                img[qi + 1] = data[ti + 2];
                img[qi + 2] = data[ti + 4];
                img[qi + 3] = 255;
              }
            } else if (bps == 32) {
              var ndt = new Float32Array(data.buffer);
              var min = 0;
              for (var i2 = 0; i2 < ndt.length; i2++) min = Math.min(min, ndt[i2]);
              if (min < 0) for (var i2 = 0; i2 < data.length; i2 += 4) {
                var t = data[i2];
                data[i2] = data[i2 + 3];
                data[i2 + 3] = t;
                t = data[i2 + 1];
                data[i2 + 1] = data[i2 + 2];
                data[i2 + 2] = t;
              }
              var pmap = [];
              for (var i2 = 0; i2 < 65536; i2++) pmap.push(gamma(i2 / 65535));
              for (var i2 = 0; i2 < ndt.length; i2++) {
                var cv = Math.max(0, Math.min(1, ndt[i2]));
                ndt[i2] = pmap[~~(0.5 + cv * 65535)];
              }
              if (smpls == 3) for (var i2 = 0; i2 < area; i2++) {
                var qi = i2 << 2, ti = i2 * 3;
                img[qi] = ~~(0.5 + ndt[ti] * 255);
                img[qi + 1] = ~~(0.5 + ndt[ti + 1] * 255);
                img[qi + 2] = ~~(0.5 + ndt[ti + 2] * 255);
                img[qi + 3] = 255;
              }
              else if (smpls == 4) for (var i2 = 0; i2 < area; i2++) {
                var qi = i2 << 2, ti = i2 * 4;
                img[qi] = ~~(0.5 + ndt[ti] * 255);
                img[qi + 1] = ~~(0.5 + ndt[ti + 1] * 255);
                img[qi + 2] = ~~(0.5 + ndt[ti + 2] * 255);
                img[qi + 3] = ~~(0.5 + ndt[ti + 3] * 255);
              }
              else throw smpls;
            } else throw bps;
          } else if (intp == 3) {
            var map = out["t320"];
            var cn = 1 << bps;
            var nexta = bps == 8 && smpls > 1 && out["t338"] && out["t338"][0] != 0;
            for (var y = 0; y < h; y++)
              for (var x = 0; x < w; x++) {
                var i2 = y * w + x;
                var qi = i2 << 2, mi = 0;
                var dof = y * bpl;
                if (false) {
                } else if (bps == 1) mi = data[dof + (x >>> 3)] >>> 7 - (x & 7) & 1;
                else if (bps == 2) mi = data[dof + (x >>> 2)] >>> 6 - 2 * (x & 3) & 3;
                else if (bps == 4) mi = data[dof + (x >>> 1)] >>> 4 - 4 * (x & 1) & 15;
                else if (bps == 8) mi = data[dof + x * smpls];
                else throw bps;
                img[qi] = map[mi] >> 8;
                img[qi + 1] = map[cn + mi] >> 8;
                img[qi + 2] = map[cn + cn + mi] >> 8;
                img[qi + 3] = nexta ? data[dof + x * smpls + 1] : 255;
              }
          } else if (intp == 5) {
            var gotAlpha = smpls > 4 ? 1 : 0;
            for (var i2 = 0; i2 < area; i2++) {
              var qi = i2 << 2, si = i2 * smpls;
              if (window.UDOC) {
                var C = data[si], M = data[si + 1], Y = data[si + 2], K = data[si + 3];
                var c = UDOC.C.cmykToRgb([C * (1 / 255), M * (1 / 255), Y * (1 / 255), K * (1 / 255)]);
                img[qi] = ~~(0.5 + 255 * c[0]);
                img[qi + 1] = ~~(0.5 + 255 * c[1]);
                img[qi + 2] = ~~(0.5 + 255 * c[2]);
              } else {
                var C = 255 - data[si], M = 255 - data[si + 1], Y = 255 - data[si + 2], K = (255 - data[si + 3]) * (1 / 255);
                img[qi] = ~~(C * K + 0.5);
                img[qi + 1] = ~~(M * K + 0.5);
                img[qi + 2] = ~~(Y * K + 0.5);
              }
              img[qi + 3] = 255 * (1 - gotAlpha) + data[si + 4] * gotAlpha;
            }
          } else if (intp == 6 && out["t278"]) {
            var rps = out["t278"][0];
            for (var y = 0; y < h; y += rps) {
              var i2 = y * w, len = rps * w;
              for (var j = 0; j < len; j++) {
                var qi = 4 * (i2 + j), si = 3 * i2 + 4 * (j >>> 1);
                var Y = data[si + (j & 1)], Cb = data[si + 2] - 128, Cr = data[si + 3] - 128;
                var r = Y + ((Cr >> 2) + (Cr >> 3) + (Cr >> 5));
                var g = Y - ((Cb >> 2) + (Cb >> 4) + (Cb >> 5)) - ((Cr >> 1) + (Cr >> 3) + (Cr >> 4) + (Cr >> 5));
                var b = Y + (Cb + (Cb >> 1) + (Cb >> 2) + (Cb >> 6));
                img[qi] = Math.max(0, Math.min(255, r));
                img[qi + 1] = Math.max(0, Math.min(255, g));
                img[qi + 2] = Math.max(0, Math.min(255, b));
                img[qi + 3] = 255;
              }
            }
          } else if (intp == 32845) {
            for (var y = 0; y < h; y++)
              for (var x = 0; x < w; x++) {
                var si = (y * w + x) * 6, qi = (y * w + x) * 4;
                var L = data[si + 1] << 8 | data[si];
                var L = Math.pow(2, (L + 0.5) / 256 - 64);
                var u = (data[si + 3] + 0.5) / 410;
                var v = (data[si + 5] + 0.5) / 410;
                var sX = 9 * u / (6 * u - 16 * v + 12);
                var sY = 4 * v / (6 * u - 16 * v + 12);
                var bY = L;
                var X = sX * bY / sY, Y = bY, Z = (1 - sX - sY) * bY / sY;
                var r = 2.69 * X - 1.276 * Y - 0.414 * Z;
                var g = -1.022 * X + 1.978 * Y + 0.044 * Z;
                var b = 0.061 * X - 0.224 * Y + 1.163 * Z;
                img[qi] = gamma(Math.min(r, 1)) * 255;
                img[qi + 1] = gamma(Math.min(g, 1)) * 255;
                img[qi + 2] = gamma(Math.min(b, 1)) * 255;
                img[qi + 3] = 255;
              }
          } else log("Unknown Photometric interpretation: " + intp);
          return img;
        };
        UTIF3.replaceIMG = function(imgs) {
          if (imgs == null) imgs = document.getElementsByTagName("img");
          var sufs = ["tif", "tiff", "dng", "cr2", "nef"];
          for (var i2 = 0; i2 < imgs.length; i2++) {
            var img = imgs[i2], src = img.getAttribute("src");
            if (src == null) continue;
            var suff = src.split(".").pop().toLowerCase();
            if (sufs.indexOf(suff) == -1) continue;
            var xhr = new XMLHttpRequest();
            UTIF3._xhrs.push(xhr);
            UTIF3._imgs.push(img);
            xhr.open("GET", src);
            xhr.responseType = "arraybuffer";
            xhr.onload = UTIF3._imgLoaded;
            xhr.send();
          }
        };
        UTIF3._xhrs = [];
        UTIF3._imgs = [];
        UTIF3._imgLoaded = function(e) {
          var ind = UTIF3._xhrs.indexOf(e.target), img = UTIF3._imgs[ind];
          UTIF3._xhrs.splice(ind, 1);
          UTIF3._imgs.splice(ind, 1);
          img.setAttribute("src", UTIF3.bufferToURI(e.target.response));
        };
        UTIF3.bufferToURI = function(buff) {
          var ifds = UTIF3.decode(buff);
          var vsns = ifds, ma = 0, page = vsns[0];
          if (ifds[0].subIFD) vsns = vsns.concat(ifds[0].subIFD);
          for (var i2 = 0; i2 < vsns.length; i2++) {
            var img = vsns[i2];
            if (img["t258"] == null || img["t258"].length < 3) continue;
            var ar = img["t256"] * img["t257"];
            if (ar > ma) {
              ma = ar;
              page = img;
            }
          }
          UTIF3.decodeImage(buff, page, ifds);
          var rgba = UTIF3.toRGBA8(page), w = page.width, h = page.height;
          var cnv = document.createElement("canvas");
          cnv.width = w;
          cnv.height = h;
          var ctx = cnv.getContext("2d");
          var imgd = new ImageData(new Uint8ClampedArray(rgba.buffer), w, h);
          ctx.putImageData(imgd, 0, 0);
          return cnv.toDataURL();
        };
        UTIF3._binBE = {
          nextZero: function(data, o) {
            while (data[o] != 0) o++;
            return o;
          },
          readUshort: function(buff, p) {
            return buff[p] << 8 | buff[p + 1];
          },
          readShort: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            a[0] = buff[p + 1];
            a[1] = buff[p + 0];
            return UTIF3._binBE.i16[0];
          },
          readInt: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            a[0] = buff[p + 3];
            a[1] = buff[p + 2];
            a[2] = buff[p + 1];
            a[3] = buff[p + 0];
            return UTIF3._binBE.i32[0];
          },
          readUint: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            a[0] = buff[p + 3];
            a[1] = buff[p + 2];
            a[2] = buff[p + 1];
            a[3] = buff[p + 0];
            return UTIF3._binBE.ui32[0];
          },
          readASCII: function(buff, p, l) {
            var s = "";
            for (var i2 = 0; i2 < l; i2++) s += String.fromCharCode(buff[p + i2]);
            return s;
          },
          readFloat: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            for (var i2 = 0; i2 < 4; i2++) a[i2] = buff[p + 3 - i2];
            return UTIF3._binBE.fl32[0];
          },
          readDouble: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            for (var i2 = 0; i2 < 8; i2++) a[i2] = buff[p + 7 - i2];
            return UTIF3._binBE.fl64[0];
          },
          writeUshort: function(buff, p, n) {
            buff[p] = n >> 8 & 255;
            buff[p + 1] = n & 255;
          },
          writeInt: function(buff, p, n) {
            var a = UTIF3._binBE.ui8;
            UTIF3._binBE.i32[0] = n;
            buff[p + 3] = a[0];
            buff[p + 2] = a[1];
            buff[p + 1] = a[2];
            buff[p + 0] = a[3];
          },
          writeUint: function(buff, p, n) {
            buff[p] = n >> 24 & 255;
            buff[p + 1] = n >> 16 & 255;
            buff[p + 2] = n >> 8 & 255;
            buff[p + 3] = n >> 0 & 255;
          },
          writeASCII: function(buff, p, s) {
            for (var i2 = 0; i2 < s.length; i2++) buff[p + i2] = s.charCodeAt(i2);
          },
          writeDouble: function(buff, p, n) {
            UTIF3._binBE.fl64[0] = n;
            for (var i2 = 0; i2 < 8; i2++) buff[p + i2] = UTIF3._binBE.ui8[7 - i2];
          }
        };
        UTIF3._binBE.ui8 = new Uint8Array(8);
        UTIF3._binBE.i16 = new Int16Array(UTIF3._binBE.ui8.buffer);
        UTIF3._binBE.i32 = new Int32Array(UTIF3._binBE.ui8.buffer);
        UTIF3._binBE.ui32 = new Uint32Array(UTIF3._binBE.ui8.buffer);
        UTIF3._binBE.fl32 = new Float32Array(UTIF3._binBE.ui8.buffer);
        UTIF3._binBE.fl64 = new Float64Array(UTIF3._binBE.ui8.buffer);
        UTIF3._binLE = {
          nextZero: UTIF3._binBE.nextZero,
          readUshort: function(buff, p) {
            return buff[p + 1] << 8 | buff[p];
          },
          readShort: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            a[0] = buff[p + 0];
            a[1] = buff[p + 1];
            return UTIF3._binBE.i16[0];
          },
          readInt: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            a[0] = buff[p + 0];
            a[1] = buff[p + 1];
            a[2] = buff[p + 2];
            a[3] = buff[p + 3];
            return UTIF3._binBE.i32[0];
          },
          readUint: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            a[0] = buff[p + 0];
            a[1] = buff[p + 1];
            a[2] = buff[p + 2];
            a[3] = buff[p + 3];
            return UTIF3._binBE.ui32[0];
          },
          readASCII: UTIF3._binBE.readASCII,
          readFloat: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            for (var i2 = 0; i2 < 4; i2++) a[i2] = buff[p + i2];
            return UTIF3._binBE.fl32[0];
          },
          readDouble: function(buff, p) {
            var a = UTIF3._binBE.ui8;
            for (var i2 = 0; i2 < 8; i2++) a[i2] = buff[p + i2];
            return UTIF3._binBE.fl64[0];
          },
          writeUshort: function(buff, p, n) {
            buff[p] = n & 255;
            buff[p + 1] = n >> 8 & 255;
          },
          writeInt: function(buff, p, n) {
            var a = UTIF3._binBE.ui8;
            UTIF3._binBE.i32[0] = n;
            buff[p + 0] = a[0];
            buff[p + 1] = a[1];
            buff[p + 2] = a[2];
            buff[p + 3] = a[3];
          },
          writeUint: function(buff, p, n) {
            buff[p] = n >>> 0 & 255;
            buff[p + 1] = n >>> 8 & 255;
            buff[p + 2] = n >>> 16 & 255;
            buff[p + 3] = n >>> 24 & 255;
          },
          writeASCII: UTIF3._binBE.writeASCII
        };
        UTIF3._copyTile = function(tb, tw, th, b, w, h, xoff, yoff) {
          var xlim = Math.min(tw, w - xoff);
          var ylim = Math.min(th, h - yoff);
          for (var y = 0; y < ylim; y++) {
            var tof = (yoff + y) * w + xoff;
            var sof = y * tw;
            for (var x = 0; x < xlim; x++) b[tof + x] = tb[sof + x];
          }
        };
        UTIF3.LosslessJpegDecode = /* @__PURE__ */ (function() {
          var b, O;
          function l() {
            return b[O++];
          }
          function m() {
            return b[O++] << 8 | b[O++];
          }
          function a0(h) {
            var V = l(), I = [0, 0, 0, 255], f = [], G = 8;
            for (var w = 0; w < 16; w++) f[w] = l();
            for (var w = 0; w < 16; w++) {
              for (var x = 0; x < f[w]; x++) {
                var T = z(I, 0, w + 1, 1);
                I[T + 3] = l();
              }
            }
            var E = new Uint8Array(1 << G);
            h[V] = [new Uint8Array(I), E];
            for (var w = 0; w < 1 << G; w++) {
              var s = G, _ = w, Y = 0, F = 0;
              while (I[Y + 3] == 255 && s != 0) {
                F = _ >> --s & 1;
                Y = I[Y + F];
              }
              E[w] = Y;
            }
          }
          function z(h, V, I, f) {
            if (h[V + 3] != 255) return 0;
            if (I == 0) return V;
            for (var w = 0; w < 2; w++) {
              if (h[V + w] == 0) {
                h[V + w] = h.length;
                h.push(0, 0, f, 255);
              }
              var x = z(h, h[V + w], I - 1, f + 1);
              if (x != 0) return x;
            }
            return 0;
          }
          function i2(h) {
            var V = h.b, I = h.f;
            while (V < 25 && h.a < h.d) {
              var f = h.data[h.a++];
              if (f == 255 && !h.c) h.a++;
              I = I << 8 | f;
              V += 8;
            }
            if (V < 0) throw "e";
            h.b = V;
            h.f = I;
          }
          function H(h, V) {
            if (V.b < h) i2(V);
            return V.f >> (V.b -= h) & 65535 >> 16 - h;
          }
          function g(h, V) {
            var I = h[0], f = 0, w = 255, x = 0;
            if (V.b < 16) i2(V);
            var T = V.f >> V.b - 8 & 255;
            f = h[1][T];
            w = I[f + 3];
            V.b -= I[f + 2];
            while (w == 255) {
              x = V.f >> --V.b & 1;
              f = I[f + x];
              w = I[f + 3];
            }
            return w;
          }
          function P(h, V) {
            if (h < 32768 >> 16 - V) h += -(1 << V) + 1;
            return h;
          }
          function a2(h, V) {
            var I = g(h, V);
            if (I == 0) return 0;
            if (I == 16) return -32768;
            var f = H(I, V);
            return P(f, I);
          }
          function X(h, V, I, f, w, x) {
            var T = 0;
            for (var G = 0; G < x; G++) {
              var s = G * V;
              for (var _ = 0; _ < V; _ += w) {
                T++;
                for (var Y = 0; Y < w; Y++) h[s + _ + Y] = a2(f[Y], I);
              }
              if (I.e != 0 && T % I.e == 0 && G != 0) {
                var F = I.a, t = I.data;
                while (t[F] != 255 || !(208 <= t[F + 1] && t[F + 1] <= 215)) F--;
                I.a = F + 2;
                I.f = 0;
                I.b = 0;
              }
            }
          }
          function o(h, V) {
            return P(H(h, V), h);
          }
          function a1(h, V, I, f, w) {
            var x = b.length - O;
            for (var T = 0; T < x; T += 4) {
              var G = b[O + T];
              b[O + T] = b[O + T + 3];
              b[O + T + 3] = G;
              var G = b[O + T + 1];
              b[O + T + 1] = b[O + T + 2];
              b[O + T + 2] = G;
            }
            for (var E = 0; E < w; E++) {
              var s = 32768, _ = 32768;
              for (var Y = 0; Y < V; Y += 2) {
                var F = g(f, I), t = g(f, I);
                if (F != 0) s += o(F, I);
                if (t != 0) _ += o(t, I);
                h[E * V + Y] = s & 65535;
                h[E * V + Y + 1] = _ & 65535;
              }
            }
          }
          function C(h) {
            b = h;
            O = 0;
            if (m() != 65496) throw "e";
            var V = [], I = 0, f = 0, w = 0, x = [], T = [], G = [], E = 0, s = 0, _ = 0;
            while (true) {
              var Y = m();
              if (Y == 65535) {
                O--;
                continue;
              }
              var F = m();
              if (Y == 65475) {
                f = l();
                s = m();
                _ = m();
                E = l();
                for (var t = 0; t < E; t++) {
                  var a = l(), J = l(), r = l();
                  if (r != 0) throw "e";
                  V[a] = [t, J >> 4, J & 15];
                }
              } else if (Y == 65476) {
                var a3 = O + F - 2;
                while (O < a3) a0(T);
              } else if (Y == 65498) {
                O++;
                for (var t = 0; t < E; t++) {
                  var a5 = l(), v = V[a5];
                  G[v[0]] = T[l() >>> 4];
                  x[v[0]] = v.slice(1);
                }
                I = l();
                O += 2;
                break;
              } else if (Y == 65501) {
                w = m();
              } else {
                O += F - 2;
              }
            }
            var a4 = f > 8 ? Uint16Array : Uint8Array, $ = new a4(s * _ * E), M = { b: 0, f: 0, c: I == 8, a: O, data: b, d: b.length, e: w };
            if (M.c) a1($, _ * E, M, G[0], s);
            else {
              var c = [], p = 0, D = 0;
              for (var t = 0; t < E; t++) {
                var N = x[t], S = N[0], K = N[1];
                if (S > p) p = S;
                if (K > D) D = K;
                c.push(S * K);
              }
              if (p != 1 || D != 1) {
                if (E != 3 || c[1] != 1 || c[2] != 1) throw "e";
                if (p != 2 || D != 1 && D != 2) throw "e";
                var u = [], Z = 0;
                for (var t = 0; t < E; t++) {
                  for (var R = 0; R < c[t]; R++) u.push(G[t]);
                  Z += c[t];
                }
                var B = _ / p, e = s / D, d = B * e;
                X($, B * Z, M, u, Z, e);
                j($, I, B, e, Z - 2, Z, Z, f);
                var A = new Uint16Array(d * c[0]);
                if (p == 2 && D == 2) {
                  for (var t = 0; t < d; t++) {
                    A[4 * t] = $[6 * t];
                    A[4 * t + 1] = $[6 * t + 1];
                    A[4 * t + 2] = $[6 * t + 2];
                    A[4 * t + 3] = $[6 * t + 3];
                  }
                  j(A, I, B * 4, e, 0, 1, 1, f);
                  for (var t = 0; t < d; t++) {
                    $[6 * t] = A[4 * t];
                    $[6 * t + 1] = A[4 * t + 1];
                    $[6 * t + 2] = A[4 * t + 2];
                    $[6 * t + 3] = A[4 * t + 3];
                  }
                }
                if (p == 2 && D == 1) {
                  for (var t = 0; t < d; t++) {
                    A[2 * t] = $[4 * t];
                    A[2 * t + 1] = $[4 * t + 1];
                  }
                  j(A, I, B * 2, e, 0, 1, 1, f);
                  for (var t = 0; t < d; t++) {
                    $[4 * t] = A[2 * t];
                    $[4 * t + 1] = A[2 * t + 1];
                  }
                }
                var n = $.slice(0);
                for (var K = 0; K < s; K++) {
                  if (D == 2) for (var S = 0; S < _; S++) {
                    var q = (K * _ + S) * E, k = ((K >>> 1) * B + (S >>> 1)) * Z, y = (K & 1) * 2 + (S & 1);
                    $[q] = n[k + y];
                    $[q + 1] = n[k + 4];
                    $[q + 2] = n[k + 5];
                  }
                  else for (var S = 0; S < _; S++) {
                    var q = (K * _ + S) * E, k = (K * B + (S >>> 1)) * Z, y = S & 1;
                    $[q] = n[k + y];
                    $[q + 1] = n[k + 2];
                    $[q + 2] = n[k + 3];
                  }
                }
              } else {
                X($, _ * E, M, G, E, s);
                if (w == 0) j($, I, _, s, 0, E, E, f);
                else {
                  var U = Math.floor(w / _);
                  for (var K = 0; K < s; K += U) {
                    var L = $.slice(K * _ * E, (K + U) * _ * E);
                    j(L, I, _, U, 0, E, E, f);
                    $.set(L, K * _ * E);
                  }
                }
              }
            }
            return $;
          }
          function j(h, V, I, f, w, x, G, E) {
            var s = I * G;
            for (var _ = w; _ < x; _++) h[_] += 1 << E - 1;
            for (var Y = G; Y < s; Y += G) for (var _ = w; _ < x; _++) h[Y + _] += h[Y + _ - G];
            for (var F = 1; F < f; F++) {
              var t = F * s;
              for (var _ = w; _ < x; _++) h[t + _] += h[t + _ - s];
              for (var Y = G; Y < s; Y += G) {
                for (var _ = w; _ < x; _++) {
                  var a = t + Y + _, J = a - s, r = h[a - G], Q = 0;
                  if (V == 0) Q = 0;
                  else if (V == 1) Q = r;
                  else if (V == 2) Q = h[J];
                  else if (V == 3) Q = h[J - G];
                  else if (V == 4) Q = r + (h[J] - h[J - G]);
                  else if (V == 5) Q = r + (h[J] - h[J - G] >>> 1);
                  else if (V == 6) Q = h[J] + (r - h[J - G] >>> 1);
                  else if (V == 7) Q = r + h[J] >>> 1;
                  else throw V;
                  h[a] += Q;
                }
              }
            }
          }
          return C;
        })();
        (function() {
          var G = 0, F = 1, i2 = 2, b = 3, J = 4, N = 5, E = 6, s = 7, c = 8, T = 9, a3 = 10, f = 11, q = 12, M = 13, m = 14, x = 15, L = 16, $ = 17, p = 18;
          function a5(t) {
            var Z = UTIF3._binBE.readUshort, u = { b: Z(t, 0), i: t[2], C: t[3], u: t[4], q: Z(t, 5), k: Z(t, 7), e: Z(t, 9), l: Z(t, 11), s: t[13], d: Z(t, 14) };
            if (u.b != 18771 || u.i > 1 || u.q < 6 || u.q % 6 || u.e < 768 || u.e % 24 || u.l != 768 || u.k < u.l || u.k % u.l || u.k - u.e >= u.l || u.s > 16 || u.s != u.k / u.l || u.s != Math.ceil(u.e / u.l) || u.d != u.q / 6 || u.u != 12 && u.u != 14 && u.u != 16 || u.C != 16 && u.C != 0) {
              throw "Invalid data";
            }
            if (u.i == 0) {
              throw "Not implemented. We need this file!";
            }
            u.h = u.C == 16;
            u.m = (u.h ? u.l * 2 / 3 : u.l >>> 1) | 0;
            u.A = u.m + 2;
            u.f = 64;
            u.g = (1 << u.u) - 1;
            u.n = 4 * u.u;
            return u;
          }
          function a7(t, Z) {
            var u = new Array(Z.s), e = 4 * Z.s, Q = 16 + e;
            if (e & 12) Q += 16 - (e & 12);
            for (var V = 0, O = 16; V < Z.s; O += 4) {
              var o = UTIF3._binBE.readUint(t, O);
              u[V] = t.slice(Q, Q + o);
              u[V].j = 0;
              u[V].a = 0;
              Q += o;
              V++;
            }
            if (Q != t.length) throw "Invalid data";
            return u;
          }
          function a6(t, Z) {
            for (var u = -Z[4], e = 0; u <= Z[4]; e++, u++) {
              t[e] = u <= -Z[3] ? -4 : u <= -Z[2] ? -3 : u <= -Z[1] ? -2 : u < -Z[0] ? -1 : u <= Z[0] ? 0 : u < Z[1] ? 1 : u < Z[2] ? 2 : u < Z[3] ? 3 : 4;
            }
          }
          function a1(t, Z, u) {
            var e = [Z, 3 * Z + 18, 5 * Z + 67, 7 * Z + 276, u];
            t.o = Z;
            t.w = (e[4] + 2 * Z) / (2 * Z + 1) + 1 | 0;
            t.v = Math.ceil(Math.log2(t.w));
            t.t = 9;
            a6(t.c, e);
          }
          function a2(t) {
            var Z = { c: new Int8Array(2 << t.u) };
            a1(Z, 0, t.g);
            return Z;
          }
          function D(t) {
            var Z = [[], [], []], u = Math.max(2, t.w + 32 >>> 6);
            for (var e = 0; e < 3; e++) {
              for (var Q = 0; Q < 41; Q++) {
                Z[e][Q] = [u, 1];
              }
            }
            return Z;
          }
          function a4(t) {
            for (var Z = -1, u = 0; !u; Z++) {
              u = t[t.j] >>> 7 - t.a & 1;
              t.a++;
              t.a &= 7;
              if (!t.a) t.j++;
            }
            return Z;
          }
          function K(t, Z) {
            var u = 0, e = 8 - t.a, Q = t.j, V = t.a;
            if (Z) {
              if (Z >= e) {
                do {
                  u <<= e;
                  Z -= e;
                  u |= t[t.j] & (1 << e) - 1;
                  t.j++;
                  e = 8;
                } while (Z >= 8);
              }
              if (Z) {
                u <<= Z;
                e -= Z;
                u |= t[t.j] >>> e & (1 << Z) - 1;
              }
              t.a = 8 - e;
            }
            return u;
          }
          function a0(t, Z) {
            var u = 0;
            if (Z < t) {
              while (u <= 14 && Z << ++u < t) ;
            }
            return u;
          }
          function r(t, Z, u, e, Q, V, O, o) {
            if (o == null) o = 0;
            var X = V + 1, k = X % 2, j = 0, I = 0, a = 0, l, R, w = e[Q], S = e[Q - 1], H = e[Q - 2][X], g = S[X - 1], Y = S[X], P = S[X + 1], A = w[X - 1], v = w[X + 1], y = Math.abs, d, C, n, h;
            if (k) {
              d = y(P - Y);
              C = y(H - Y);
              n = y(g - Y);
            }
            if (k) {
              h = d > n && C < d ? H + g : d < n && C < n ? H + P : P + g;
              h = h + 2 * Y >>> 2;
              if (o) {
                w[X] = h;
                return;
              }
              l = Z.t * Z.c[t.g + Y - H] + Z.c[t.g + g - Y];
            } else {
              h = Y > g && Y > P || Y < g && Y < P ? v + A + 2 * Y >>> 2 : A + v >>> 1;
              l = Z.t * Z.c[t.g + Y - g] + Z.c[t.g + g - A];
            }
            R = y(l);
            var W = a4(u);
            if (W < t.n - Z.v - 1) {
              var z = a0(O[R][0], O[R][1]);
              a = K(u, z) + (W << z);
            } else {
              a = K(u, Z.v) + 1;
            }
            a = a & 1 ? -1 - (a >>> 1) : a >>> 1;
            O[R][0] += y(a);
            if (O[R][1] == t.f) {
              O[R][0] >>>= 1;
              O[R][1] >>>= 1;
            }
            O[R][1]++;
            h = l < 0 ? h - a : h + a;
            if (t.i) {
              if (h < 0) h += Z.w;
              else if (h > t.g) h -= Z.w;
            }
            w[X] = h >= 0 ? Math.min(h, t.g) : 0;
          }
          function U(t, Z, u) {
            var e = t[0].length;
            for (var Q = Z; Q <= u; Q++) {
              t[Q][0] = t[Q - 1][1];
              t[Q][e - 1] = t[Q - 1][e - 2];
            }
          }
          function B(t) {
            U(t, s, q);
            U(t, i2, J);
            U(t, x, $);
          }
          function _(t, Z, u, e, Q, V, O, o, X, k, j, I, a) {
            var l = 0, R = 1, w = Q < M && Q > J;
            while (R < t.m) {
              if (l < t.m) {
                r(t, Z, u, e, Q, l, O[X], t.h && (w && k || !w && (j || (l & I) == a)));
                r(t, Z, u, e, V, l, O[X], t.h && (!w && k || w && (j || (l & I) == a)));
                l += 2;
              }
              if (l > 8) {
                r(t, Z, u, e, Q, R, o[X]);
                r(t, Z, u, e, V, R, o[X]);
                R += 2;
              }
            }
            B(e);
          }
          function a8(t, Z, u, e, Q, V) {
            _(t, Z, u, e, i2, s, Q, V, 0, 0, 1, 0, 8);
            _(t, Z, u, e, c, x, Q, V, 1, 0, 1, 0, 8);
            _(t, Z, u, e, b, T, Q, V, 2, 1, 0, 3, 0);
            _(t, Z, u, e, a3, L, Q, V, 0, 0, 0, 3, 2);
            _(t, Z, u, e, J, f, Q, V, 1, 0, 0, 3, 2);
            _(t, Z, u, e, q, $, Q, V, 2, 1, 0, 3, 0);
          }
          function a9(t, Z, u, e, Q, V) {
            var O = V.length, o = t.l;
            if (Q + 1 == t.s) o = t.e - Q * t.l;
            var X = 6 * t.e * e + Q * t.l;
            for (var k = 0; k < 6; k++) {
              for (var j = 0; j < o; j++) {
                var I = V[k % O][j % O], a;
                if (I == 0) {
                  a = i2 + (k >>> 1);
                } else if (I == 2) {
                  a = x + (k >>> 1);
                } else {
                  a = s + k;
                }
                var l = t.h ? (j * 2 / 3 & 2147483646 | j % 3 & 1) + (j % 3 >>> 1) : j >>> 1;
                Z[X + j] = u[a][l + 1];
              }
              X += t.e;
            }
          }
          UTIF3._decompressRAF = function(t, Z) {
            var u = a5(t), e = a7(t, u), Q = a2(u), V = new Int16Array(u.e * u.q);
            if (Z == null) {
              Z = u.h ? [[1, 1, 0, 1, 1, 2], [1, 1, 2, 1, 1, 0], [2, 0, 1, 0, 2, 1], [1, 1, 2, 1, 1, 0], [1, 1, 0, 1, 1, 2], [0, 2, 1, 2, 0, 1]] : [[0, 1], [3, 2]];
            }
            var O = [[G, b], [F, J], [N, f], [E, q], [M, L], [m, $]], o = [];
            for (var X = 0; X < p; X++) {
              o[X] = new Uint16Array(u.A);
            }
            for (var k = 0; k < u.s; k++) {
              var j = D(Q), I = D(Q);
              for (var X = 0; X < p; X++) {
                for (var a = 0; a < u.A; a++) {
                  o[X][a] = 0;
                }
              }
              for (var l = 0; l < u.d; l++) {
                a8(u, Q, e[k], o, j, I);
                for (var X = 0; X < 6; X++) {
                  for (var a = 0; a < u.A; a++) {
                    o[O[X][0]][a] = o[O[X][1]][a];
                  }
                }
                a9(u, V, o, l, k, Z);
                for (var X = i2; X < p; X++) {
                  if ([N, E, M, m].indexOf(X) == -1) {
                    for (var a = 0; a < u.A; a++) {
                      o[X][a] = 0;
                    }
                  }
                }
                B(o);
              }
            }
            return V;
          };
        })();
      })(UTIF2, pako2);
    })();
  }
});

// ../streaming-pdf-reader/dist/index.js
var import_utif2 = __toESM(require_UTIF(), 1);

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/utils.js
var import_pako = __toESM(require_pako());
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = new Uint8Array(256);
for (i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}
var i;
var decodeFromBase64 = function(base642) {
  var bufferLength = base642.length * 0.75;
  var len = base642.length;
  var i2;
  var p = 0;
  var encoded1;
  var encoded2;
  var encoded3;
  var encoded4;
  if (base642[base642.length - 1] === "=") {
    bufferLength--;
    if (base642[base642.length - 2] === "=") {
      bufferLength--;
    }
  }
  var bytes = new Uint8Array(bufferLength);
  for (i2 = 0; i2 < len; i2 += 4) {
    encoded1 = lookup[base642.charCodeAt(i2)];
    encoded2 = lookup[base642.charCodeAt(i2 + 1)];
    encoded3 = lookup[base642.charCodeAt(i2 + 2)];
    encoded4 = lookup[base642.charCodeAt(i2 + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return bytes;
};
var arrayToString = function(array) {
  var str = "";
  for (var i2 = 0; i2 < array.length; i2++) {
    str += String.fromCharCode(array[i2]);
  }
  return str;
};
var decompressJson = function(compressedJson) {
  return arrayToString(import_pako.default.inflate(decodeFromBase64(compressedJson)));
};
var padStart = function(value, length, padChar) {
  var padding = "";
  for (var idx = 0, len = length - value.length; idx < len; idx++) {
    padding += padChar;
  }
  return padding + value;
};

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Courier-Bold.compressed.json
var Courier_Bold_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Courier-BoldOblique.compressed.json
var Courier_BoldOblique_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Courier-Oblique.compressed.json
var Courier_Oblique_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Courier.compressed.json
var Courier_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Helvetica-Bold.compressed.json
var Helvetica_Bold_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Helvetica-BoldOblique.compressed.json
var Helvetica_BoldOblique_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Helvetica-Oblique.compressed.json
var Helvetica_Oblique_compressed_default = "eJyNnVtzG8mxrf+KAk/nRGh8eBWleZPnItsaD0dXWNvhB5BsUdgC0TLAFgjt2P/9AI2uzJUrV7X8olB/q4CuyspaVX0p8H8mP7V3d83yfvLj5P3fu/Xstnl0fPbsydGjJ89Oz55MHk9+bZf3v8/uml2BvzSLr839/Hr2w+XVYv7vrtnL3WLB8iOQZ3fzxZYL7IRpM7/9tD/r35ubeXe3I3+9ny3m18+Xt4td2R+OT3Zk/ev8obn5Y35//Wny4/2qax5Pfvo0W82u75vVm2b/6V8e7pvlTXPzur2bLYfa/vnP7cPkx3/+cHxx9PiHk5Pzx8fHx08ePzs9/tfjybtd4dVivmz+aNfz+3m73J/q6AiEt5/m15+XzXo9+fF8x983q3VfbHJ0dPKno6Oj3Ul+b3eN2Dfop/bLdrVvx6P/c/1/Hx0/e3r+eP/vRf/vs/2/z476fy8ePb9pr5pHb7br++Zu/eivy+t29aVdze6bmz89evR8sXj0ev8960evm3Wz+rqjHs35+tHs0f1qdtPczVafH7UfH/02X7b32y/ND7tCi0fPXzyaLW/+X7t6NN99wbq7Ws9v5rPVvFn/aVfZX3anupkvb99cf2r6Xuhr8uZ+95HZ6qaou4I/zb78ZeiUi+Onjyf/KEfnJ6ePJ8/X1/tArwbx58aOfzg5ung8eXN/85fpTnzS//f97r9Pnx566+/N/Wp+vQvnP/9nMv3H5MeTi53w+64i6y+zXRT/9zHh5uF6Mbszfnp+fuD/7tpdtK4WppyfPzkoy+7uat9Nt8us3bSLxWxl/OmuW3r+pVld79O+CE+eXByE2d1OWu+i4zU7OYEa9P3ttTs9Hb5vtmqWi+ZjTaKPlWrM1vtvXH/2ij89Gz616NY5ONe70TrLp/i0/fKpWebiu6bM25vM14vZ+lMO1rdm1WbaLpsM7zei5P2nVSPKfmy7laDzr6Lsev4gYPO1EX3bhJh6OsyXIq2u20UrIrRu7uZRsh5Y7E0g0ebf3WyR8e2q2Q1m0cydD657oynK8dHxkNEzkX7PM/qzoYuSiT9l9HP+4C+Ojo8P6Ff/YInAi/xdf8lx+qu3bG+Xe/S3fMaXuf2/+dgr2fr3fMbfc70u89f/kUu9yt/1On/wTY7E2/zBd/mD7w09Oxt6eppL/SOjD/mM/5WjerWbyz4398E3XNxpcaDy56KpnD0xU7mez6/nq+vuLvdHt3ft9W76gTESDC5Uxj42y+gqp8S1MGAxbnODPuZStxl9ylWeZ/TfuV6fc6lFzksRLeE6wve+iGGfTXqV6yUcXsS+yx/8mrN3k0s9ZLTN6BtU9czzKybCyZOjkpWrSvmYjeaMfTbezxc3TQ7JYa6/aTcizmF69qngvl+meXIclxH3cb8uRKO1z2zV5PFx0a7mgq+byrdcd6vdPH7tATx+dgzDZj3vV66piWXZoofVbTffKXftvV467OX+i78jU+hLz36cCyYWULuVnFwP3Mxub9WcduC4FqMVx77vmlUDY//0whZDs9vV7Iuf7fS8ZNbuUqKBjAuu1DfzarYeifC4utKLBeuAqO+uCYZa7VbY8y/r+VpIu7bef2q7sFg0ty/zfkhu77nV7Kuo7Oy6uxf44OUfF81D1ioj6252vWrFia9WjTrxTXs/uw4jzqX5ricxAG5oOA69srsLut2aWyxSu+XtbNXdLWadOE17u1tnfhZfN1uFxZP1y13IWRee+7Ln9GJg7erm426hF1aGvkKJk6wvQCL3M1zCGZ6c2xnudk7XLfAUdrUxE1PezX7Qr9diAlvEE1tKtZHbiqRtctnd+NxdEe/yXkwxf01d6k4QM9Cn/5g3PjXJTvWvi73nq6NcgzJd3My/ziGh/SOxZr5gFoPDqx0/5Cs99SGbIikGNln3F180TKCp+Sv9fGGoOK53xIzGg3+m0kMdfcCvAtJJ/Jph5xFwEXJSnFg19KI4+HW56SFORa7j68KYB95KHZffVQV8eNRyNJqqr/Rlc+xSqvZt0VghnMkqIUNmsvlr9kQbivN49rOLoc6L9luzvBWZ+zqewq/iRpOzGx0kQvThVZtIVpW2XnNb/fonR85O8/ZTuxKtuqSzexgqbvCG+FmZxChsNpo4Yy1ienLr73Csu36VsxL1pRS0KNY42WoxwbtucT//stiKelEDPclDA88uyqXJbHU/ny1u5h8/5r7a1q3h93geT9ixZPllNM1GZp0sWTpVhueyZoO1jPk9BsgnQ/oivP+2WzHgTTi7BFq1n5slXgiZOa6a2/k6Ln19iMbOhuk4jwtzjm43qsP1iAe7soZcVSLTUmR8XFZS6r9ohJ89K2vX/lZXvBFmcf7l/lOGPyUDNDNXvnV6PLTxvjJvNNXZsTYLPq8tH0ayMgbYr5dpaNitCK6UuUKtR2pTT20aXdcGZR7Hdu7RZQnPmGVd0CzuxQ2f+2DS7ombdsQR6/G960RLKOYWKrnO9LFAofcr1bjCeVpuWPQ+vkvg1S6R1/n73qR8ffas5Kte0b4cnX9/ix3nlxL2WEeZYrIFt4wYJue16ey3WG2Lwy5qn2YLmBrKIN9fmtCtbuuLMZdfxmWTp9p3OrAyFJpag26jmWKDhm5Vvar77o1cIFoGy5qflR682dmEeujRxi4CK9SW1sXyZ+dm5zfza2W0P8cvgoXZ2HL399g/Xt1Kv70ez2ulurdWltDPqyYdLwesB6jOZsQjC8pfatM9O4XdIpYNtQVZXAnYt40OhUoV7kfPtGhv9/29bEW427qZdlkqQ3n3VZWRfDt+RQszuce8kr5LOY/bzZ1lXjS759fG+C/d/nHkvx5PXjar5R+z+Wr/EPmfk+f7h9WTxz+cHv3r8XB0cI+ADvWMaDB1hC/i0cFVAsKGoXAZj3IVcOoN3Loq0MP4Dyg4T1CGkAV2uDsU0GHgIHoVjt7ujo5P/LAELbDQflDe7Q7P/agEAFAIAHAIANASAEAUAFAsAMCGoR1Y7yhI3u+OLuxoGrQP+wYe+WFpEjKoO+AuhLXLydBVkqGTydDlZOiqydCJZOgsFsCGWDj5ujs6s6NNONrGo9IiQFDzgQ6FcHQaopAYp3HqnAdrUV4IRMPWuBy7Rb0UqFJLOZRNzF1oEvWjcd2ZJnOPmkBj3DgN9MJfZYRD3hiPexfk4C8yOIAhsgHjygtMzIZgErmCcW0NJrM/mMAmYUJ0ioLBLgqa5lJoHMbYPUwQFlK0LncYm4nxsZwUtmJSJScrBmNyLSeT1ZgQ/aZgMJ2CNhltBSIPMp6NaPADNCJDFE7jZETO2YiK8kIgMiLj0oiKeilQpZbSiEzMnW4Sdbpx3ekmc6ebQEZknIyo8FcZoREZYyNyQRpRkcGIDJERGVdGZGI2IpPIiIxrIzKZjcgENiITohEVDEZU0DSXQiMyxkZkgjCionW5w9iIjI/lpDAikyo5WTEik2s5mYzIhGhEBYMRFbTJaCsQGZHxbEQYGnSjyCmwUSRfIpHNKcgvapxsKorSq0KRyxofa4i0rlgi50rUKWGiqLMmluHUiSp5WhTJ2IL4qsLR4qLAPkeqNLtQBhwvcrK9KCrviyWyAUadXDCK2gpjGfbDqLIpRjU6Y9DAHgOfVsqjUUaB3TKqwjJDga6SCmyeUfzu0BA2GvWxoVEx1FhmdGgka41q9NeggckGvqnwbY2T50YxG68TtF2k1CEokeUGiQ0XxBeaktmiJK0WClxqWq+6NFnUcx6hSlmEks4hLMEZhBpZK0pkrCC9khRNFTFbatCkoUIJsFOkZKYoKStFPRspqmSjKGkTxRJsoaixgaIW7RMUME+gU1kWjRMx2yZqwjRB7mQ3s2Gi9J0kF2aJaj3JK0aJJUaSPJkkatEiQQGDBLqRdKspWSNK2RiH1qMrGqKQGyc/dM5mWJQXApENGpceWNRLgSq1lNZnYk4JkygfjOtkMJkzwQTyOuNkdIW/yggtzhj7mwvS3IoMzmaIbM248jQTs6GZRG5mXFuZyexjJrCJmRAdrGCwr4KmuRQalzF2LROEZRWtyx3GZmV8LCeFTZlUycmKQZlcy8lkTSZEXyoYTKmgTUZbgciLjGcjKnVFJ3JGAXWBvAgENiOTXihGduSC9COTLxWrVVZakqu5/12jBHBBZ4DrnAKukC+5QMZkwivB0JocsjeBIs3JdHAnZ2RPLih/cjUblGvkUC5oi3KdPcoVNilXoksZB5syNhXl0KgcslO5IqzKxE50IZuVC6PpKuzKtVq6VgzL9Wq6JstyJXqWcTAtYxvBtoqRb7mQjatUDI3LGQXXBTIuENi4THqhGBmXC9K4TL5UrFZZaVyu5kxwjTLBBZ0JrnMmuELG5QIZlwmvBEPjcsjGBYo0LtPBuJyRcbmgjMvVbFyukXG5oI3LdTYuV9i4XInGZRyMy9hUlEPjcsjG5YowLhM70YVsXC6MpqswLtdq6VoxLter6ZqMy5VoXMbBuIxtBNsqRsblQjau1fBDH16FQiiwBZNlGWbDGoQXmZBZFSytahAvM9HVkyZVtNznRaEeL1j3d1G5twsnayqYjGnArxJBUyqILcm4NKRBBTsqhMyoYGVFRctGVBSyoYK1CRWVLahwNqDCo/0MFMxnINNUBo2nILadwoXpDFKXuocNp+CRxBNmUxSdeBWjKWol8ZLJFB4tZqBgMAPZJLLNhKyl4GwsQ7qjsxiiEBonb3HO5lKUFwKRvRiX/lLUS4EqtZQWY2LuapOor43rzjaZe9sE8hnjZDSFv8oIrcYYe40L0myKDG5jiOzGuPIbE7PhmESOY1xbjsnsOSaw6ZgQXadgsJ2CprkUGo8xdh4ThPUUrcsdxuZjfCwnhf2YVMnJigGZXMvJZEEmRA8qGEyooE1GW4HIh4wnI/rzkJvHfuSdYSjED3joHqMlaoAoYKBYrIBZmIANEXJy+F2vxz+cGBl+uqugn6DQqRErNKDyShyVLJiLD8OfixecihdrTh8wgT7y8w49t+7pj2Jn9qi4OKDQR8BTl/e09BEg6wlg1hPAhp4AUizVkXvBz4MNuLZ3gGd+VFoHCKrstATQv9YiN6DSCRA+QxRD4xRI4yqaJuaQmkRxNc7BNYEjbEIMs2GKdeHvcximuRSE3hDF33juBM59Ol/qjn4fYeyOgrg7CufuKFx2RxFFdxSJu6Pw1B1FSN1RBOqOgrk7Bv4+h2GaS2F3FMTdUbjojkHi7hgwdcevQ0889aNyKkAl/oBC6IFDhYCWgAOyWAOzMAMbIgykBNfRzBYU/VFcQfWotACQWE/1PC2lehpXUT2iFVLPaHHUs7Au6klpgaPSW8eOfIXRH8VFTI/iyv+A8pKm52k1c6C27S/guL7pEa1dekbLlj1r41Guc1upYCsr2OaatHKR1Suijm1c7vcorvR/xTEB0V/tx+W5HZkzOSrRRxQW+wfhb8MIO6w+/oYjDFDJT0AhUsAhUkBLpABZPIBZnwEb8hNICZGjWTzKLZjlFswqLZjJFsxyC2aiBTPRgllqwSy3IK60/paXWHvUhY90uZldpU2dbFOX28QXCaCI1naitV1o7cvJ4Tr83I+i/fVIeF3Pk9f1NHpdj+TFYq+QC/asjDpA0fJeDv525kdx7n+J/oYoz/gvyd+Qgr8BjtP/y+BvwGjSfzn4GxzlOreVCraygm2uCfsbKKKO5m+A4trj5QSviV9O0uXwy5TVwJMrv5yk69+XIqtBIVd+OckXvC8nfK27J9uQLduc1ducvcGAcVyQQF9GqhotVOS7p6YxRKoeTlSIRxbJNMhIpfEWVUgPEiijSaUByapIfSqSRwEXyCOWStCQIZXHCMk8pKPcVoXRsMgxT0W+13B2AlK1KVCh8bazVZBKrhFVMBASyEtIVbZCRbLDUAEyG1K171AhtiCS2Y1IjsYUxW1thLFdkZrs47fJcGP52A/tnjKyeDvZlffxcH9ZeWFH/d3VMz+0e3nA8Kad4/ijr1ky/sT41oL1GwYCUOrz38Ke6mNiHIfanmqS3wsGYQk7js+IcYDkjmPSaqEKOscLd+lSLDhyapfuIJV7LRg+Yxw+F2T48NYRMwgf3jsqLU03j5Igwle0WviCzuEr4jbHgsNnXIQvDM4QxKikUJKsAxoKva8qGNwghBBHJQU6yircoUQ16LlUCn0yQhnN1A1VIxwKDNNU6AZj3AEuyNAX+b1gEO6CMNDGOMQmiOAWrRbWoHNAi7jNseAgGk/h2y154W5DfxQvYnsUr9V7JK5re56ua3sar2t7RFevPaOr156Fq9eexGv1y6Hvz/woLjsvc3+78N5m1Muhjz0u/9gdPbGjD9b/l9jNgKDpTsttBD+l3UYYUPFp6AZD1BfGqUOMq14xMXeNSdQ/xrmTTOCeMiF2l2HqM5y/KQzce5XZm1ToR5y7TyOCHsXp/IIQ9a2azEmiXk6P/QYe9k5Cf0dOnR5F6vkoqu6PJXIORJ0SIYqcDVHllIhqzIuoUXKkndwqepwmY/u4VRFImLRt+VRwSJ20nflCcUqi6mZmpVM6BY1zCjadQUYhpXxCibIJJZVLqOdMQpXyCCXOItQ4h1CLGYQK5Q9tWc1x4typb1jNBSBvaMfmaaKQM7SP8yJTypfKLs6sUq6AwplStgRBmhiiHDFOCWJcZYeJOTVMorwwzklhAmeECTEdDFMu4MY+CgNnQWVbH6nQ/7jl7TQi6HncBXdBiPpc7YEjiXq7YO7qeJsDe5wV6niWqf9ZVmnAZXI2cAlKCpY5N1jnFGE9ZgqrlDAkv63GlNMnySqLqBAkEymQU6RAapECGcYKJRrLOd+oBKUdqZx9tocH8s4ZZZwLlGsuqCxzNeeXa5RZLnBOucLZ5ErMI+eUQWHHHkeEs6a2X49lyJSwhe2UGGRH2NZ2wYwyQm5qY42ywDj3f7nchO43RL1vnDrfuOp7E3PXm0Q9b5w73gTudxNitxumXsfbEBQG7vPKTQhSocfxFsRpRNDfeFfighD1tronQRL1dcHc1eWVUOhqQ9TVxqmrjauuNjF3tUnU1ca5q03grjYhdrVh6mp8sZvCwF1dea2bVOhqfOX5NCLoanwL+oIQdbV6B5ok6uqCqav/GHp5eCX9D+xhZKV3kcUXf0HAe2KA7dVfYP6GL0B/xRdgeccXUOlBYLPQMntDBVB8i7BH4sldz9Pjup7GZ3Q9omduPaOHjD0L7wn2JD5w+wP67fipocYyqT+KD5V6VBIUUX583fP00OlA4Ykr4Pj8ukf0PLpn9L7bnrXxKNe5rVSwlRVsc034cSgooo724BNQfDr+B46OIfqvJvgGfH8U34DvkXgDvufpDfiexjfgeyTfgO8VegO+Z/QGfM/CG/CvJ4e3Hk78KLp2j4Qx9zx5ck+jHfdIvsPUK+TRPSvxBxQd+PVgvqd+FF9tfJ0t14V3NoheYy8BEqP8NfUS0DjKX4teAoXG/+vQS8DC+H8d5ojXYXp4PUwDrn2II+g1mf9Ayy1K6H1DlALGVR6YmJPBJMoI4zotTObcMIESxDhlCd5kPiVE+VK5yUwqZI4hSh/jKodMzIlkEmWTcZ1SJnNemcDJZULMsHwf3dA0B+JDLsVZp26aD1J5sgqpZ4hSz7hKPRNz6plEqWdcp57JnHomUOoZp9TDB+ynhCj1Ko/XSYXUM0SpZ1ylnok59Uyi1DOuU89kTj0TOPVMiKmHLxBQhkxzID7kUpx66u2BIqX3/U6kwGk48r6fLiJSUr/vp9VKelbe99Myp6p+30+qmLb6jYaKKlM4lMFEjgKnc1RlUsciIrVjAU7wqFbSPBZKyR7llPJRpsRPL3rILJ3WQvmh9ok0IKpveRwKvJnwPsg3k7QP8g0/6yTMxXmbF+FUPG1xTEL6SGgWfyyI9NFdfuO1bH9I17I9o2vZnqlr2V7I17I9pmvZnvG1bA/5WraH8Vq2R3Qt+3YwsjM/iiPpbbIs4GnMvEVzAiRHx9tgQ8Diu6Nv0XAczWIjZqIH7Br8iaNaB8x0B8xEB/hlOHyviv8sx98uxP2j1+0CfPgtJCN8jqrQiNbaxXlgleY2urnh+hx5CYNXuxFRaFQUPm2/fGr6ennntbFIK5rT1qre6qq3oqf40h0lUX27dsdyucP84t2LrehQNGgl+of2cIGybu7mOTO6WKgTp+lqcet03DoRN37RGSURt051e5eTfxMPt3QoGoOvnA3nww3WpWTaYZ0E9mK9xzqpImRpl3USkj/nfdZJoWClndYsgGenqx/myr3V1Q9L5OO1qx+W2dHT1Q9z8vbCZ6LZyeVNIKs3Ptq/yvRNq/Vvsn8Tqt3LE4FxMhdf9YSBz4sh/hpVyzRDmMA25MJYqNSE4ZqYNUykqcN4LYx5EilKmkmK0IrCaU4xYbSdanYxrZYStXnG9Fpb04xjQiUz0txThJVitRCkqcgFOR8VWUxKRepE8TQ9mTDaBWqiMq3WBbUpy/RaF+TJy5TKqN0ItlWs1nw1q4ULjjC3RSV9Z5TTPBdlHfdYRkU/lkh9EOU8/0U9BzzqHPaophkx3ZQ5kwLPjiM3ZXQRMVPqmzJarcyalZsyWuYZVN+UkeqsGrI8p0aZZ9ao/gcZJWfZWGI8o/KMG+XvJFSafaPKTkv3BaLbyZsG+ovr7clzc5STO5P8/ZDL2ZpKqDk7FuGZO6rjnSJm8aDnuTzIbfWDeV6P8n8QHTnHxxLjCVmd72Op8QjluT/Ko3mZ1wFBXtWV8fDllQHJen0QCqlVQijQVT+aVwxR/g86V64eYonxzq2uJGKp8c4Vq4qoj3rSpqps68p46PKa492w0DjzozhHvsMFBSAxV76jhQPQOCu+CwsEYHTv+x0sBIDEKe7dhF8/ejdJbx6VJwPY1rRDijm1Wu+QYjG3P+2QYs6RyDukWIgxSTukiFN0KjuLwuMRjJPeWSRFitjIziJZIsdO7yySIkexsrNIqjGeemeREimyY5ts4NESBldtshESBba6yUboOahqk42QOKByk43QYjDVJpssUSDrO1DKAziMYdqBwpyip3egsJjjlnagMOeI5R0oLMRYpR0oxClKlZ0b73h7Ql2hgNV2blRkFb6RnRuVEhTM6s6Nis6hrezcqKgU6NEtC6xy2MOWhcQo1HnLQhJUeOWWhaRRSMWWhaRwGNOWhcQpdJU3/J1zuOyPHTxXjMLlAoXLBRUuV3O4XKNwucDhcoXD5UoMl3MKlwkULuMcruEH3J9nQqEqmAJVsApT0XKQikIhKpgDVDiHp/AYnEIpNAOmwAyUwvJ+CMlTPyrhABR/S/R9CgPw9Fui77H5gOi3RN+HZgMLvyX6Hpvr6EVoz4vYcz2KV1wuXMajmAo9Ev3d89TXPY393CN5y6pXqPd7Fm9O9Sh27x75b8T2R3G7QY9KCACFhgBPmxJ6WhoCyKoLzHoM2NBjQEoLHJUr2zMg5TbQeUGxk5ucmHaPB5FOzEYmZrh/AzjnayPytRH5andkHLXxKDejrdS5lXVuc+X4Tgoootp2ywRQHlNwb8Q6BO9JeM91oWe7nI1dJfU6mXpdTj2+mQCKSMpOJGUXknI6uN65H8XXtaboeoDELogpuR7QuAtiGlwPGO3HmILrAYnbH6YTfHVyit4FSLwkOSXvAhpfh5wK7wKFXnyconcBiq84Tie452eK3gUo2vc0eRfwZMJT9C5AZLXT4F3AwgQ7Re9yVJzqqZG9fupHpU2A4jub02RUwNPvA03ZqADHX9qbBqMCRj+XN0Wj8oa1oUCbm6F+CXpKRgU0V07/EvQ0GBWw+EvQUzQqR2ZU3h9dKNDlhqhfOZySIwHNDdE/YjgNjgRMxD/+RuGebMM42ebxvE3j9sNgZMMPZX1AJ0NmDzSBxbvAIOCtX8B2vxeYP6QE6DdtAZY7tYDsGaSzvaU9PbcjmyodxanSOU6VTm2qdMRTpSs+VTqzqdKRTZWG+mXLmTXCHwUCiwuyD8nUsGz+lbIPaGvIaPr7EHwNC5b4A7L4OyuT+xMgw7LMC9FnGtFcf/iGrNLeRrc3PlsDLuLQiDg0Kg78wGzP5mE4zeO46xFtVv4weCV8RyuC0NYa3OoGt6Jh6RkZSD74ANrjMGCio3115wxXd54AXRyhnbCXrmYlnbaSTlhJel4EknKZTrlMRy6DDy0S44akxxZJkM1UDy6Sxg3Ojy6SktrHDy8SZz/F7YWDWaXthcyVvarthSyR0da2F7LMlpu2FzIn8y0cHcoYD0kTyIuNy/Fqqhi0pvHINYF9yYRkTqaQUxuPF9HGacTyMyv+GlXL5OAmsI27MBYqZeiuCVc3sRbH5O8mVOOYnL4IYPeGyPONs/EXoRXfm6YAE0aDpSYD02rxqE0LptfileYHE3iSSE85WRDTRZFwzjBW81s9e5g6YqtpHjGhMpmYXrXdPK2YQrZLjyMV5harB5JKkwGpPJJUModFPpRUYmq8eCypJJ55QIPJBynNPyipKQj1PAuhShMRSnouwhI8HaFGMxJKNCmBhA6MmK0CNZqdUJJGggWEl6DMdoIaOwZqyWRRpPkKJZqywvPqYBziSbb4vkrV0/SFGs9gQftOONU8FmQxlaE+Eu40oaE2Fu40rYEGMxtSmtxQ4vkNtFafI81yqH0voGquQ3kkYLUZD4ukCyIUeeJDjec+9fqE0MQMCCpOgohHZgU9FWKBcedPEyJqlTkRi4xNDnlmRDFODvudwl8tq/ZHm3DkP5feH8X7cz1K9+GKZeL3FrTJaJs/yKcxns81WDCeq6BNRtv8QT6X8Xyu8M4TnDDwTYVvK9/D549irgR0JVQB6EbSrfwGPjlK+dTlJRw4b0GbjLb5g3w64/lc9i4FnMzYRrCt+Cyfz4V8QnsbAU5obCPYVnyWT+hCPiH8zfuTQDaJbNOn+ETib94PCv5Z65OINhlt8wf5VOrPWh+kqx292luLHcUXG/ZkYefsj+KE16P4/B+E+MzqapLekLia4J8YvEIHBySetF2RXwONT9quhDuDQk/aroIXAws/nHgVOudqgk8XrjD+gFJdr3E5dl7I56B/VpG9TnchzgP+nEvq70l7Ns8D/pxLVr4n/bJF+SYTPqvS+tsOU/5k/WV2vQ/h+UD7L85/R+Qoy6TlSMULb0NfbVTEkbY/egjaNmjU2zzQBqo7zTDXByfk0/gNm/ylD7nUNpfiiqo5epB0ahjm2hYOtcWdiPSlD7nUNpfi2qqdiUVSbz2Xqsm3npWIldfLg8gfKuW3lfKpQbVlw6Cry7ZzVrhFtNY4TV+1kSd4kGW3siy3o7ICKapfxqVmgJTaARo2BPBGn+RBl97q0qkxqOXW8LvOQ23Tu87EoQV5+WXoIZfa5lJcY7UiG6T01utQrfzWKwtQYbGEc/Ygym1FOa60XNYNWnr5dKhcfvmUBai1WAc6exDltqIc11quDQ/ax8nhftSpH8VFWI/K3SdA4l2JnqelWk/juxI9ojciekZvRPQsvBHRk/i2x0eIuJPdeFg063V/8+NpgfFDTW4ovZFzQLqh+Y2cA01v5PQ4t5/fyOmZaH8bj3Kd1es3PZcVbHNN9Os3vSLqSK/f9Ch3CP1F7o95CfQkCgM9rJr21xf9Nks/svsjjuwmHqC4hfIglMvslUD0tcbpu52rE4j9oVKgk9V2h2pVnDj+jTnx5+X0X5b7PIyEEz+KfvEZRwKifDnzmUYCUhgJgONVzucwEoDRtcznYSTAUa5zW6lgKyvY5prwSABF1LGNV4mfcSQMKO9a1wK1pbJnvaKKRtd3rFcK5L6q7FfXKkentl9dym1VGA2L7O36ZnRdYLRZlXSo7UTXMiVJZSP6Qb2bDDeI/Sh6Ro/ET5X3HO8CO40/Vd4j+VPlvUI/Vd4z+qnynoWfKr8bbOiwqrlDGwKEtevpMjR2mRu7rDR2KRu7zI1dVhu7FI1disYuU2PjfcJlaPoyN52XigMNj8SPIqIgVB6Ik5jDkR+HE9eBEQ/DSeAQpUfhEUOw8BKfAsFhU5f4gxR+FekoIopd5TeRSMyxy7+IRFzHLv8eEgscu/RzSBFD7MKPIcVAcOzUDYci5d+KOFICx3HslyJkERHTyu9ESLUS38qvRGg5xVr/SIQSMe75JyJUKFMfVH8gYihQbm1DHxii6BtXcTcxR9wkirVxHWWTOb4mcGRNiDHNjwOWeO+fAsERVPf+D9JuvUB3+/eEbtC3w4n9I5tw5NdKbVhFt3kV3cpVdFmccFXSjVHiUCm8MUroIZ9nKxBVtP7wspW3Gs+ExvVOtxqHmqZbjYo/VCqwrXFq0HeeUML6jtukbjVmCdpDtxozfZCn3WpK7Rh92NnyzbmziLn+eHNuqCbenCP0kM+zFYgqXH9c2o7u5meV604yNIGUTVV5qFZlW1eoeSznVlY23rf5FiQL0KZwC5LZgzjZVjGq+8iT5XKx0d/ROz+PqHwNc9vQSDzuaiQRTs2S7W8k7pscSfCdjiSU7Y6Ebc9j5FcZXQtUCUN5VJh5eeyXlCExnkV8k0ve7Bo+u89cVKOpVK+pVK8Z66Wm3kvxj4WRVunBptaDTa0HP2YkOvS2koHxFhirnzKaC1SJ53wsbvN63OaV2MxrsZnXYvPfGYlSn0djsBCo0uDF+BfZX1aL/C4j0cZl5ZzLStIuR+uyrIzvVqDKidux3m3rvdtWejf9mTqSa53fVsLaVpr4RaAyzZDN/DsXXQlUCdCq0jOr0Z4REVtXTrCunGBdtdP16KkVGv1AJ1Clrt1YtnT1bOkq2cLXVSzXsqWrWUWnJ8L9QuMizvubjPx9eUPbXMoWGcyh+SR9yzX6Vonwt0o2fBOzkP7bp4Z52YUXmcfxGzYZwZorv4bWVl5Da+uvoX2Bip6eF+IPvwxtw0foBF/0dw/fUnt3KOo1sbyOdHjcRl9l6pmri+bjffnSw/9/OL8wtXywX+UcZWwrnayFaoqvXOmPuYUJzfJKadEecol1BY+ccD1yQrQ2pX63OkNfHIbZaljFH/tRvC20wrU7IHGTaEUrdqDx1tAqrNOB0R2fFazOgdgL84aGl+JOARwGy7mR3aLtMEhXsFwDgu0B7M0BOLQGSGkMoNIWR/EgdJTzRThI9VzUPjZ4nZPdmurEDpbhYPhWIEO+IcHzAB+C7+QLxt0syQMP+xS83O47z/wgnMt5h83pUig63WWd6rIudRnNniDkvuxyXw5zpYOv2LxtOBhqDsSrOMByRw2GoiEaj8ZpUBpXI9PEPDxNojFqnAeqCTxaTYhD1jCNW7+xicnBtzvPI/ZhbCQmhmGRHaalFDEl5olhygnjlBjwijETNW6LuMhEN0qOfhOjBRTsPlDIMpPoCIajLTgW3mBiNAi7TZ06mK2i8OwXRXFzMKKcAx56Uig6HVVlJOKJJys6VbSvpMedzCuJFG0G7u1TaLaZRNcRt+wHJfytJkJkPekvNTFX1iP/UBNJZD35zzSxwNaT/koTYbIe+iNNp0yD9RTs1mMk5pNhkU+mpXwyJeaTYcoY45QxsCuBiTKNIi4y0Y2S1mNitJ6C3XoKWWYSrcdwtB7HwnpMjNZjL+OnDmbrEX8biT7h7mJEWQ+8M0Ch6HRUlfWIFwZY0amirSe9LcC8kkjReuBVAQrNNpNoPeI9gaKEp9doQFFgG4oqm1FUpSXFIsKYYgG2p6gmk4pysqook2FFkW0rqJSppEULCyIYWeSUo1FUmRpL5HyNOmVtFDk7o8o5GtQql5YViixqfCwU2gpjETLEIIItBr6scbLIKJJRkqjsMhYh0wzil0p6JQMNqrDRoINfRi4tlV8lkiFle62/SKRLfCd12XDH3iLSZUbTO1mweoVIal8rId7WOFlz7fWhg563VoktVeVNhuEjfP02FEqrfuLwDXpv3TpN3sTxGyobLtfiT4knBb9Hemr5hB4RUoXv9LFBWziHo/3fzGUS7wY6Frf6ivg+kandfy1k/+fjn0VSZlrCMENGpdzoHe7gnmZxUA73hb8O0/zBbL7i3A6oTOiA4jvYzvHFa6f2trUjf3vamb8u7qzsY3Zir04bKonw1NoU9Sa3yd+tB6Tb1Mg2xVfnHeemNqKpjWhqG49yndtKBVtZwTbXJL3X7oqoo7/B7ijHnn5vd1PWjed2FN/v24QVoqO4LHSe3gLchAWgI1/1OfOlnrOyvnNiizpDJaGeWJt80bfBhAIUt/FsUkIBT+vbDScU4LjW3YSEAkar2s2QUHCU69xWKtjKCra5JulneFwRdfQf3XEUF9QbTKhD8B8muH3vAYMPKG7fe0jBB56etz1w8AHHTXMPIfjAaPvetriqH9lodmSu6kjsbNmyqzqNe1i20VWd0SacLbqqk7ghZYvT65GhWKDJjaItS9tsq85lo8SOpG2wVUeirbzhaFts1Y9yndV+oi3bqtNcE71daBtt1VncGLQNtmrIly9D9PGBxAkhalN6IMFcNVg9kGCJmp4fSLDA3cEPJBhTHNLSlWIhinJOGqfEdD4SC5GiLuU8Na0Sp5SxJtTi1ApUaaDMYhPrDeF8Nq6T2uRaWzi9jVf6NiU6vDINuY6UIoASZTxKKj6o5xChSlFCiSOBGncsanEMoEKhUr+rkYOlP8DjASUaEkEaD5YYGEHNYwPleizTCEFtJJatpvW2y9GC+mgDecygpIcNlhhpIw8elOpJwUPoW1mvnttRXIN/C+tVQHkN/o3Xq0Bxveo4Ls2/xfWqM1qafyvrVT/KdW4rFWxlBdtck7RedUXU0derjuK1wjeciRhR/dNMlLhonJqJkpT7Ic1EzLm1eSYioRWo0kDZS2omYqlS2Uqn5ZmIBeq+NBMNvNyvUoiaaJz60Llouom56S7lPjSNwmKc220C92ERWoEqDZR9aGK9IdyHxnUfmlxrC/ehcepD/BWkGqamBo36M2oiFKFADkeUc98GnUIWNI5LELmfUWwreCQIss9DgfGGct8HTfd/KDLWVs6DoEEu/Ot//z8nhUqv";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Helvetica.compressed.json
var Helvetica_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Times-Bold.compressed.json
var Times_Bold_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Times-BoldItalic.compressed.json
var Times_BoldItalic_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Times-Italic.compressed.json
var Times_Italic_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Times-Roman.compressed.json
var Times_Roman_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Symbol.compressed.json
var Symbol_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/ZapfDingbats.compressed.json
var ZapfDingbats_compressed_default = "eJxtmNtu20YQhl+F4FULyMGeD7pz3AY1ChtG7NpFA18w1NomIlECSRcxgrx7SVk7+wOdG8H5OJydf2Z2d5gf9cV+t0v9VK/r+6vXsXlOlbHe28paq229qj/t++m62aXZ4J/m8PRb1z9/baZxefK63Z6eXN5dVMvTCh83u277xr/6kLrnl2XNq7TpXnczuZyabdee98/b2VzM/x4/dd/T5qab2pd6PQ2vaVVfvDRD005puE3Lu7eH1HbN9hTjx4/77/X6y5lcnUmjVzHIVVDicVX/1W/SsO36dLMfu6nb9/X6TAoBD+5euvZbn8axXtuZ36dhPJrVQqgPQoh5hev91LWLkIv94W1Ygq9+aX+tZAx2tfz64284/sblN/rqfLP/mqrbt3FKu7G67Nv9cNgPzZQ2H6rz7bb6vLgZq89pTMO/M/xfEqturJpqSM/d7GJIm2oamk3aNcO3av80O5xh3yyKmm1193ZIT02bqovTKjP+MAf++7zsZvZ3276kYyWWXB0z99S18/PbafPHQ71W4fjn/fxnFO+ZvkrT0LVzTr78qB/+nk38bHM9exgP8zr1z9U7jt6840YW5uSJKcZOCaBBnKgm5mU8MVNYyMwWFvO7Ukagkmgg6sDWQ5yFFqjzUrLEaQ3BEmiwNsMSaZS0vgWfOkPHWQowNeTUc0kumnxZvsgPxlGai6VTGUqAVCTQ6QkWnc77DKEiLktSUBJKqHIQZ86d8gCpHYoiEzMsb1ubYy8vW50DChB5ZhGqrijD0EqUIeiaEHIfCg5Kpuu0ApiToaGPSY0uaQsyr65L2oKi1yFt1PLaQ3lzfXTgXodGoJYzglndSLDMPg1sTPJpQJHJigw0QrGERqD9YhyTOgONQDUyuF1zaxuokc/BW2ztXCMrGZ9WMW1oQZHIXWNBkSCfRZEL5BMUiZw6CzVSFCfUSGZFNjIldoKDkonTKQiJIGzWmFd3BizJJ9SINoLDriOfUCOZS+zg+KGD1qGiLNMLxtJD1/ns00ON6EzyUCM6vbxhoBKaqbG3DFQCNiL1iHccBPV0DHhQH/JW8EW90dkyFKGywCJU0WkVSvSGeiSUODWFFD0HYdPQVoiRgfPMA+/nnRgiAyNYSjpWNQcNSMrtFCUH4ZIRpSCWocFCSuhCEY6hoUClc0WC52BJlCYYLQdhN+hygRRRlo5BKRRLS6oihSqh+ZzzRGG1Mo4Iz1LoP0qsxDGFzk0JE42ji0jCPejomJKCuwil4m5CiRMEUMVSzVLDUstSx1Juc0oVWMpqY295qVltmtWmWW2a1aZZbZrVplltmtWmWW2G1WZYbYbVZlhthtVmWG2G1WZYbYbVZlhtltVmWW2W1WZZbZbVZlltltVmWW2W1QYjQCh7E2aAQHeGhCFgPoNoy8KNb2wxBhmGKBxoUZXlLGsLI6AsftEDHV0wIURVbANLcTKlGGBIKPOAxCmhePCKUwFzAmpDFRQvjA9R06Hq8TONvshgKDCuRAZTXigUxjxNFfKRo3CLhnIJBMFRvMZpqpNBMlQJzGT5WFQMVQI/AikPMIhEU1aDjqJvQwmjSHB05cC9jbYwc5UtAHNLhDw41ha+lEqF4JaH3gmB61SYcqInxTDmQK8v08vjqv4zDf1N0w3Lf4A8/vwPpfK11w==";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Font.js
var compressedJsonForFontName = {
  "Courier": Courier_compressed_default,
  "Courier-Bold": Courier_Bold_compressed_default,
  "Courier-Oblique": Courier_Oblique_compressed_default,
  "Courier-BoldOblique": Courier_BoldOblique_compressed_default,
  "Helvetica": Helvetica_compressed_default,
  "Helvetica-Bold": Helvetica_Bold_compressed_default,
  "Helvetica-Oblique": Helvetica_Oblique_compressed_default,
  "Helvetica-BoldOblique": Helvetica_BoldOblique_compressed_default,
  "Times-Roman": Times_Roman_compressed_default,
  "Times-Bold": Times_Bold_compressed_default,
  "Times-Italic": Times_Italic_compressed_default,
  "Times-BoldItalic": Times_BoldItalic_compressed_default,
  "Symbol": Symbol_compressed_default,
  "ZapfDingbats": ZapfDingbats_compressed_default
};
var FontNames;
(function(FontNames2) {
  FontNames2["Courier"] = "Courier";
  FontNames2["CourierBold"] = "Courier-Bold";
  FontNames2["CourierOblique"] = "Courier-Oblique";
  FontNames2["CourierBoldOblique"] = "Courier-BoldOblique";
  FontNames2["Helvetica"] = "Helvetica";
  FontNames2["HelveticaBold"] = "Helvetica-Bold";
  FontNames2["HelveticaOblique"] = "Helvetica-Oblique";
  FontNames2["HelveticaBoldOblique"] = "Helvetica-BoldOblique";
  FontNames2["TimesRoman"] = "Times-Roman";
  FontNames2["TimesRomanBold"] = "Times-Bold";
  FontNames2["TimesRomanItalic"] = "Times-Italic";
  FontNames2["TimesRomanBoldItalic"] = "Times-BoldItalic";
  FontNames2["Symbol"] = "Symbol";
  FontNames2["ZapfDingbats"] = "ZapfDingbats";
})(FontNames || (FontNames = {}));
var fontCache = {};
var Font = (
  /** @class */
  (function() {
    function Font2() {
      var _this = this;
      this.getWidthOfGlyph = function(glyphName) {
        return _this.CharWidths[glyphName];
      };
      this.getXAxisKerningForPair = function(leftGlyphName, rightGlyphName) {
        return (_this.KernPairXAmounts[leftGlyphName] || {})[rightGlyphName];
      };
    }
    Font2.load = function(fontName) {
      var cachedFont = fontCache[fontName];
      if (cachedFont)
        return cachedFont;
      var json = decompressJson(compressedJsonForFontName[fontName]);
      var font = Object.assign(new Font2(), JSON.parse(json));
      font.CharWidths = font.CharMetrics.reduce(function(acc, metric) {
        acc[metric.N] = metric.WX;
        return acc;
      }, {});
      font.KernPairXAmounts = font.KernPairs.reduce(function(acc, _a) {
        var name1 = _a[0], name2 = _a[1], width = _a[2];
        if (!acc[name1])
          acc[name1] = {};
        acc[name1][name2] = width;
        return acc;
      }, {});
      fontCache[fontName] = font;
      return font;
    };
    return Font2;
  })()
);

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/all-encodings.compressed.json
var all_encodings_compressed_default = "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";

// ../streaming-pdf-reader/node_modules/.pnpm/@pdf-lib+standard-fonts@1.0.0/node_modules/@pdf-lib/standard-fonts/es/Encoding.js
var decompressedEncodings = decompressJson(all_encodings_compressed_default);
var allUnicodeMappings = JSON.parse(decompressedEncodings);
var Encoding = (
  /** @class */
  /* @__PURE__ */ (function() {
    function Encoding2(name, unicodeMappings) {
      var _this = this;
      this.canEncodeUnicodeCodePoint = function(codePoint) {
        return codePoint in _this.unicodeMappings;
      };
      this.encodeUnicodeCodePoint = function(codePoint) {
        var mapped = _this.unicodeMappings[codePoint];
        if (!mapped) {
          var str = String.fromCharCode(codePoint);
          var hexCode = "0x" + padStart(codePoint.toString(16), 4, "0");
          var msg = _this.name + ' cannot encode "' + str + '" (' + hexCode + ")";
          throw new Error(msg);
        }
        return { code: mapped[0], name: mapped[1] };
      };
      this.name = name;
      this.supportedCodePoints = Object.keys(unicodeMappings).map(Number).sort(function(a, b) {
        return a - b;
      });
      this.unicodeMappings = unicodeMappings;
    }
    return Encoding2;
  })()
);
var Encodings = {
  Symbol: new Encoding("Symbol", allUnicodeMappings.symbol),
  ZapfDingbats: new Encoding("ZapfDingbats", allUnicodeMappings.zapfdingbats),
  WinAnsi: new Encoding("WinAnsi", allUnicodeMappings.win1252)
};

// ../streaming-pdf-reader/node_modules/.pnpm/pako@2.2.0/node_modules/pako/dist/pako.esm.mjs
var Z_FIXED$1 = 4;
var Z_BINARY = 0;
var Z_TEXT = 1;
var Z_UNKNOWN$1 = 2;
function zero$1(buf) {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
}
var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES = 2;
var MIN_MATCH$1 = 3;
var MAX_MATCH$1 = 258;
var LENGTH_CODES$1 = 29;
var LITERALS$1 = 256;
var L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
var D_CODES$1 = 30;
var BL_CODES$1 = 19;
var HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
var MAX_BITS$1 = 15;
var Buf_size = 16;
var MAX_BL_BITS = 7;
var END_BLOCK = 256;
var REP_3_6 = 16;
var REPZ_3_10 = 17;
var REPZ_11_138 = 18;
var extra_lbits = (
  /* extra bits for each length code */
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0])
);
var extra_dbits = (
  /* extra bits for each distance code */
  new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13])
);
var extra_blbits = (
  /* extra bits for each bit length code */
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7])
);
var bl_order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var DIST_CODE_LEN = 512;
var static_ltree = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
var static_dtree = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
var _dist_code = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
var _length_code = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
var base_length = new Array(LENGTH_CODES$1);
zero$1(base_length);
var base_dist = new Array(D_CODES$1);
zero$1(base_dist);
function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
  this.static_tree = static_tree;
  this.extra_bits = extra_bits;
  this.extra_base = extra_base;
  this.elems = elems;
  this.max_length = max_length;
  this.has_stree = static_tree && static_tree.length;
}
var static_l_desc;
var static_d_desc;
var static_bl_desc;
function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;
  this.max_code = 0;
  this.stat_desc = stat_desc;
}
var d_code = (dist) => {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};
var put_short = (s, w) => {
  s.pending_buf[s.pending++] = w & 255;
  s.pending_buf[s.pending++] = w >>> 8 & 255;
};
var send_bits = (s, value, length) => {
  if (s.bi_valid > Buf_size - length) {
    s.bi_buf |= value << s.bi_valid & 65535;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> Buf_size - s.bi_valid;
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= value << s.bi_valid & 65535;
    s.bi_valid += length;
  }
};
var send_code = (s, c, tree) => {
  send_bits(
    s,
    tree[c * 2],
    tree[c * 2 + 1]
    /*.Len*/
  );
};
var bi_reverse = (code, len) => {
  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};
var bi_flush = (s) => {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;
  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 255;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};
var gen_bitlen = (s, desc) => {
  const tree = desc.dyn_tree;
  const max_code = desc.max_code;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const extra = desc.stat_desc.extra_bits;
  const base = desc.stat_desc.extra_base;
  const max_length = desc.stat_desc.max_length;
  let h;
  let n, m;
  let bits;
  let xbits;
  let f;
  let overflow = 0;
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    s.bl_count[bits] = 0;
  }
  tree[s.heap[s.heap_max] * 2 + 1] = 0;
  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1] = bits;
    if (n > max_code) {
      continue;
    }
    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2];
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1] + xbits);
    }
  }
  if (overflow === 0) {
    return;
  }
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) {
      bits--;
    }
    s.bl_count[bits]--;
    s.bl_count[bits + 1] += 2;
    s.bl_count[max_length]--;
    overflow -= 2;
  } while (overflow > 0);
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) {
        continue;
      }
      if (tree[m * 2 + 1] !== bits) {
        s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
        tree[m * 2 + 1] = bits;
      }
      n--;
    }
  }
};
var gen_codes = (tree, max_code, bl_count) => {
  const next_code = new Array(MAX_BITS$1 + 1);
  let code = 0;
  let bits;
  let n;
  for (bits = 1; bits <= MAX_BITS$1; bits++) {
    code = code + bl_count[bits - 1] << 1;
    next_code[bits] = code;
  }
  for (n = 0; n <= max_code; n++) {
    let len = tree[n * 2 + 1];
    if (len === 0) {
      continue;
    }
    tree[n * 2] = bi_reverse(next_code[len]++, len);
  }
};
var tr_static_init = () => {
  let n;
  let bits;
  let length;
  let code;
  let dist;
  const bl_count = new Array(MAX_BITS$1 + 1);
  length = 0;
  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < 1 << extra_lbits[code]; n++) {
      _length_code[length++] = code;
    }
  }
  _length_code[length - 1] = code;
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < 1 << extra_dbits[code]; n++) {
      _dist_code[dist++] = code;
    }
  }
  dist >>= 7;
  for (; code < D_CODES$1; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    bl_count[bits] = 0;
  }
  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1] = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1] = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1] = 8;
    n++;
    bl_count[8]++;
  }
  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);
  for (n = 0; n < D_CODES$1; n++) {
    static_dtree[n * 2 + 1] = 5;
    static_dtree[n * 2] = bi_reverse(n, 5);
  }
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES$1, MAX_BITS$1);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES$1, MAX_BL_BITS);
};
var init_block = (s) => {
  let n;
  for (n = 0; n < L_CODES$1; n++) {
    s.dyn_ltree[n * 2] = 0;
  }
  for (n = 0; n < D_CODES$1; n++) {
    s.dyn_dtree[n * 2] = 0;
  }
  for (n = 0; n < BL_CODES$1; n++) {
    s.bl_tree[n * 2] = 0;
  }
  s.dyn_ltree[END_BLOCK * 2] = 1;
  s.opt_len = s.static_len = 0;
  s.sym_next = s.matches = 0;
};
var bi_windup = (s) => {
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};
var smaller = (tree, n, m, depth) => {
  const _n2 = n * 2;
  const _m2 = m * 2;
  return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
};
var pqdownheap = (s, tree, k) => {
  const v = s.heap[k];
  let j = k << 1;
  while (j <= s.heap_len) {
    if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    if (smaller(tree, v, s.heap[j], s.depth)) {
      break;
    }
    s.heap[k] = s.heap[j];
    k = j;
    j <<= 1;
  }
  s.heap[k] = v;
};
var compress_block = (s, ltree, dtree) => {
  let dist;
  let lc;
  let sx = 0;
  let code;
  let extra;
  if (s.sym_next !== 0) {
    do {
      dist = s.pending_buf[s.sym_buf + sx++] & 255;
      dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
      lc = s.pending_buf[s.sym_buf + sx++];
      if (dist === 0) {
        send_code(s, lc, ltree);
      } else {
        code = _length_code[lc];
        send_code(s, code + LITERALS$1 + 1, ltree);
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);
        }
        dist--;
        code = d_code(dist);
        send_code(s, code, dtree);
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);
        }
      }
    } while (sx < s.sym_next);
  }
  send_code(s, END_BLOCK, ltree);
};
var build_tree = (s, desc) => {
  const tree = desc.dyn_tree;
  const stree = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems = desc.stat_desc.elems;
  let n, m;
  let max_code = -1;
  let node;
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$1;
  for (n = 0; n < elems; n++) {
    if (tree[n * 2] !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;
    } else {
      tree[n * 2 + 1] = 0;
    }
  }
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
    tree[node * 2] = 1;
    s.depth[node] = 0;
    s.opt_len--;
    if (has_stree) {
      s.static_len -= stree[node * 2 + 1];
    }
  }
  desc.max_code = max_code;
  for (n = s.heap_len >> 1; n >= 1; n--) {
    pqdownheap(s, tree, n);
  }
  node = elems;
  do {
    n = s.heap[
      1
      /*SMALLEST*/
    ];
    s.heap[
      1
      /*SMALLEST*/
    ] = s.heap[s.heap_len--];
    pqdownheap(
      s,
      tree,
      1
      /*SMALLEST*/
    );
    m = s.heap[
      1
      /*SMALLEST*/
    ];
    s.heap[--s.heap_max] = n;
    s.heap[--s.heap_max] = m;
    tree[node * 2] = tree[n * 2] + tree[m * 2];
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1] = tree[m * 2 + 1] = node;
    s.heap[
      1
      /*SMALLEST*/
    ] = node++;
    pqdownheap(
      s,
      tree,
      1
      /*SMALLEST*/
    );
  } while (s.heap_len >= 2);
  s.heap[--s.heap_max] = s.heap[
    1
    /*SMALLEST*/
  ];
  gen_bitlen(s, desc);
  gen_codes(tree, max_code, s.bl_count);
};
var scan_tree = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1] = 65535;
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      s.bl_tree[curlen * 2] += count;
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        s.bl_tree[curlen * 2]++;
      }
      s.bl_tree[REP_3_6 * 2]++;
    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]++;
    } else {
      s.bl_tree[REPZ_11_138 * 2]++;
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
var send_tree = (s, tree, max_code) => {
  let n;
  let prevlen = -1;
  let curlen;
  let nextlen = tree[0 * 2 + 1];
  let count = 0;
  let max_count = 7;
  let min_count = 4;
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1];
    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      do {
        send_code(s, curlen, s.bl_tree);
      } while (--count !== 0);
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);
    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);
    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }
    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};
var build_bl_tree = (s) => {
  let max_blindex;
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
  build_tree(s, s.bl_desc);
  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
      break;
    }
  }
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  return max_blindex;
};
var send_all_trees = (s, lcodes, dcodes, blcodes) => {
  let rank2;
  send_bits(s, lcodes - 257, 5);
  send_bits(s, dcodes - 1, 5);
  send_bits(s, blcodes - 4, 4);
  for (rank2 = 0; rank2 < blcodes; rank2++) {
    send_bits(s, s.bl_tree[bl_order[rank2] * 2 + 1], 3);
  }
  send_tree(s, s.dyn_ltree, lcodes - 1);
  send_tree(s, s.dyn_dtree, dcodes - 1);
};
var detect_data_type = (s) => {
  let block_mask = 4093624447;
  let n;
  for (n = 0; n <= 31; n++, block_mask >>>= 1) {
    if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
      return Z_BINARY;
    }
  }
  if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS$1; n++) {
    if (s.dyn_ltree[n * 2] !== 0) {
      return Z_TEXT;
    }
  }
  return Z_BINARY;
};
var static_init_done = false;
var _tr_init$1 = (s) => {
  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }
  s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
  s.bi_buf = 0;
  s.bi_valid = 0;
  init_block(s);
};
var _tr_stored_block$1 = (s, buf, stored_len, last) => {
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
  bi_windup(s);
  put_short(s, stored_len);
  put_short(s, ~stored_len);
  if (stored_len) {
    s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
  }
  s.pending += stored_len;
};
var _tr_align$1 = (s) => {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
};
var _tr_flush_block$1 = (s, buf, stored_len, last) => {
  let opt_lenb, static_lenb;
  let max_blindex = 0;
  if (s.level > 0) {
    if (s.strm.data_type === Z_UNKNOWN$1) {
      s.strm.data_type = detect_data_type(s);
    }
    build_tree(s, s.l_desc);
    build_tree(s, s.d_desc);
    max_blindex = build_bl_tree(s);
    opt_lenb = s.opt_len + 3 + 7 >>> 3;
    static_lenb = s.static_len + 3 + 7 >>> 3;
    if (static_lenb <= opt_lenb) {
      opt_lenb = static_lenb;
    }
  } else {
    opt_lenb = static_lenb = stored_len + 5;
  }
  if (stored_len + 4 <= opt_lenb && buf !== -1) {
    _tr_stored_block$1(s, buf, stored_len, last);
  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {
    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);
  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  init_block(s);
  if (last) {
    bi_windup(s);
  }
};
var _tr_tally$1 = (s, dist, lc) => {
  s.pending_buf[s.sym_buf + s.sym_next++] = dist;
  s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
  s.pending_buf[s.sym_buf + s.sym_next++] = lc;
  if (dist === 0) {
    s.dyn_ltree[lc * 2]++;
  } else {
    s.matches++;
    dist--;
    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]++;
    s.dyn_dtree[d_code(dist) * 2]++;
  }
  return s.sym_next === s.sym_end;
};
var _tr_init_1 = _tr_init$1;
var _tr_stored_block_1 = _tr_stored_block$1;
var _tr_flush_block_1 = _tr_flush_block$1;
var _tr_tally_1 = _tr_tally$1;
var _tr_align_1 = _tr_align$1;
var trees = {
  _tr_init: _tr_init_1,
  _tr_stored_block: _tr_stored_block_1,
  _tr_flush_block: _tr_flush_block_1,
  _tr_tally: _tr_tally_1,
  _tr_align: _tr_align_1
};
var adler32 = (adler, buf, len, pos) => {
  let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
  while (len !== 0) {
    n = len > 2e3 ? 2e3 : len;
    len -= n;
    do {
      s1 = s1 + buf[pos++] | 0;
      s2 = s2 + s1 | 0;
    } while (--n);
    s1 %= 65521;
    s2 %= 65521;
  }
  return s1 | s2 << 16 | 0;
};
var adler32_1 = adler32;
var makeTable = () => {
  let c, table = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c;
  }
  return table;
};
var crcTable = new Uint32Array(makeTable());
var crc32 = (crc, buf, len, pos) => {
  const t = crcTable;
  const end = pos + len;
  crc ^= -1;
  for (let i2 = pos; i2 < end; i2++) {
    crc = crc >>> 8 ^ t[(crc ^ buf[i2]) & 255];
  }
  return crc ^ -1;
};
var crc32_1 = crc32;
var messages = {
  2: "need dictionary",
  /* Z_NEED_DICT       2  */
  1: "stream end",
  /* Z_STREAM_END      1  */
  0: "",
  /* Z_OK              0  */
  "-1": "file error",
  /* Z_ERRNO         (-1) */
  "-2": "stream error",
  /* Z_STREAM_ERROR  (-2) */
  "-3": "data error",
  /* Z_DATA_ERROR    (-3) */
  "-4": "insufficient memory",
  /* Z_MEM_ERROR     (-4) */
  "-5": "buffer error",
  /* Z_BUF_ERROR     (-5) */
  "-6": "incompatible version"
  /* Z_VERSION_ERROR (-6) */
};
var constants$2 = {
  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  Z_MEM_ERROR: -4,
  Z_BUF_ERROR: -5,
  //Z_VERSION_ERROR: -6,
  /* compression levels */
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY: 0,
  Z_TEXT: 1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN: 2,
  /* The deflate compression method */
  Z_DEFLATED: 8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
var { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;
var {
  Z_NO_FLUSH: Z_NO_FLUSH$2,
  Z_PARTIAL_FLUSH,
  Z_FULL_FLUSH: Z_FULL_FLUSH$1,
  Z_FINISH: Z_FINISH$3,
  Z_BLOCK: Z_BLOCK$1,
  Z_OK: Z_OK$3,
  Z_STREAM_END: Z_STREAM_END$3,
  Z_STREAM_ERROR: Z_STREAM_ERROR$2,
  Z_DATA_ERROR: Z_DATA_ERROR$2,
  Z_BUF_ERROR: Z_BUF_ERROR$2,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_FILTERED,
  Z_HUFFMAN_ONLY,
  Z_RLE,
  Z_FIXED,
  Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_UNKNOWN,
  Z_DEFLATED: Z_DEFLATED$2
} = constants$2;
var MAX_MEM_LEVEL = 9;
var MAX_WBITS$1 = 15;
var DEF_MEM_LEVEL = 8;
var LENGTH_CODES = 29;
var LITERALS = 256;
var L_CODES = LITERALS + 1 + LENGTH_CODES;
var D_CODES = 30;
var BL_CODES = 19;
var HEAP_SIZE = 2 * L_CODES + 1;
var MAX_BITS = 15;
var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
var PRESET_DICT = 32;
var INIT_STATE = 42;
var GZIP_STATE = 57;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;
var BS_NEED_MORE = 1;
var BS_BLOCK_DONE = 2;
var BS_FINISH_STARTED = 3;
var BS_FINISH_DONE = 4;
var OS_CODE = 3;
var err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};
var rank = (f) => {
  return f * 2 - (f > 4 ? 9 : 0);
};
var zero = (buf) => {
  let len = buf.length;
  while (--len >= 0) {
    buf[len] = 0;
  }
};
var slide_hash = (s) => {
  let n, m;
  let p;
  let wsize = s.w_size;
  n = s.hash_size;
  p = n;
  do {
    m = s.head[--p];
    s.head[p] = m >= wsize ? m - wsize : 0;
  } while (--n);
  n = wsize;
  p = n;
  do {
    m = s.prev[--p];
    s.prev[p] = m >= wsize ? m - wsize : 0;
  } while (--n);
};
var HASH = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
var INSERT_STRING = (s, str) => {
  let h;
  if (s.legacy_hash) {
    h = s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
  } else {
    const w = s.window;
    const value = w[str] | w[str + 1] << 8 | w[str + 2] << 16 | w[str + 3] << 24;
    h = s.ins_h = Math.imul(value, 66521) + 66521 >>> 16 & s.hash_mask;
  }
  const hash_head = s.prev[str & s.w_mask] = s.head[h];
  s.head[h] = str;
  return hash_head;
};
var flush_pending = (strm) => {
  const s = strm.state;
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) {
    return;
  }
  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};
var flush_block_only = (s, last) => {
  _tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
};
var put_byte = (s, b) => {
  s.pending_buf[s.pending++] = b;
};
var putShortMSB = (s, b) => {
  s.pending_buf[s.pending++] = b >>> 8 & 255;
  s.pending_buf[s.pending++] = b & 255;
};
var read_buf = (strm, buf, start, size) => {
  let len = strm.avail_in;
  if (len > size) {
    len = size;
  }
  if (len === 0) {
    return 0;
  }
  strm.avail_in -= len;
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  } else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }
  strm.next_in += len;
  strm.total_in += len;
  return len;
};
var longest_match = (s, cur_match) => {
  let chain_length = s.max_chain_length;
  let scan = s.strstart;
  let match;
  let len;
  let best_len = s.prev_length;
  let nice_match = s.nice_match;
  const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
  const _win = s.window;
  const wmask = s.w_mask;
  const prev = s.prev;
  const strend = s.strstart + MAX_MATCH;
  let scan_end1 = _win[scan + best_len - 1];
  let scan_end = _win[scan + best_len];
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  if (nice_match > s.lookahead) {
    nice_match = s.lookahead;
  }
  do {
    match = cur_match;
    if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
      continue;
    }
    scan += 2;
    match++;
    do {
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;
    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1 = _win[scan + best_len - 1];
      scan_end = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};
var fill_window = (s) => {
  const _w_size = s.w_size;
  let n, more, str;
  do {
    more = s.window_size - s.lookahead - s.strstart;
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
      s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      s.block_start -= _w_size;
      if (s.insert > s.strstart) {
        s.insert = s.strstart;
      }
      slide_hash(s);
      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;
    if (!s.legacy_hash) {
      if (s.lookahead + s.insert > MIN_MATCH) {
        str = s.strstart - s.insert;
        while (s.insert) {
          INSERT_STRING(s, str);
          str++;
          s.insert--;
          if (s.lookahead + s.insert <= MIN_MATCH) {
            break;
          }
        }
      }
    } else if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];
      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
      while (s.insert) {
        INSERT_STRING(s, str);
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
};
var deflate_stored = (s, flush) => {
  let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
  let len, left, have, last = 0;
  let used = s.strm.avail_in;
  do {
    len = 65535;
    have = s.bi_valid + 42 >> 3;
    if (s.strm.avail_out < have) {
      break;
    }
    have = s.strm.avail_out - have;
    left = s.strstart - s.block_start;
    if (len > left + s.strm.avail_in) {
      len = left + s.strm.avail_in;
    }
    if (len > have) {
      len = have;
    }
    if (len < min_block && (len === 0 && flush !== Z_FINISH$3 || flush === Z_NO_FLUSH$2 || len !== left + s.strm.avail_in)) {
      break;
    }
    last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
    _tr_stored_block(s, 0, 0, last);
    s.pending_buf[s.pending - 4] = len;
    s.pending_buf[s.pending - 3] = len >> 8;
    s.pending_buf[s.pending - 2] = ~len;
    s.pending_buf[s.pending - 1] = ~len >> 8;
    flush_pending(s.strm);
    if (left) {
      if (left > len) {
        left = len;
      }
      s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
      s.strm.next_out += left;
      s.strm.avail_out -= left;
      s.strm.total_out += left;
      s.block_start += left;
      len -= left;
    }
    if (len) {
      read_buf(s.strm, s.strm.output, s.strm.next_out, len);
      s.strm.next_out += len;
      s.strm.avail_out -= len;
      s.strm.total_out += len;
    }
  } while (last === 0);
  used -= s.strm.avail_in;
  if (used) {
    if (used >= s.w_size) {
      s.matches = 2;
      s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
      s.strstart = s.w_size;
      s.insert = s.strstart;
    } else {
      if (s.window_size - s.strstart <= used) {
        s.strstart -= s.w_size;
        s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
        if (s.matches < 2) {
          s.matches++;
        }
        if (s.insert > s.strstart) {
          s.insert = s.strstart;
        }
      }
      s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
      s.strstart += used;
      s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
    }
    s.block_start = s.strstart;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }
  if (last) {
    return BS_FINISH_DONE;
  }
  if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 && s.strm.avail_in === 0 && s.strstart === s.block_start) {
    return BS_BLOCK_DONE;
  }
  have = s.window_size - s.strstart;
  if (s.strm.avail_in > have && s.block_start >= s.w_size) {
    s.block_start -= s.w_size;
    s.strstart -= s.w_size;
    s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
    if (s.matches < 2) {
      s.matches++;
    }
    have += s.w_size;
    if (s.insert > s.strstart) {
      s.insert = s.strstart;
    }
  }
  if (have > s.strm.avail_in) {
    have = s.strm.avail_in;
  }
  if (have) {
    read_buf(s.strm, s.window, s.strstart, have);
    s.strstart += have;
    s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }
  have = s.bi_valid + 42 >> 3;
  have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
  min_block = have > s.w_size ? s.w_size : have;
  left = s.strstart - s.block_start;
  if (left >= min_block || (left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 && s.strm.avail_in === 0 && left <= have) {
    len = left > have ? have : left;
    last = flush === Z_FINISH$3 && s.strm.avail_in === 0 && len === left ? 1 : 0;
    _tr_stored_block(s, s.block_start, len, last);
    s.block_start += len;
    flush_pending(s.strm);
  }
  return last ? BS_FINISH_STARTED : BS_NEED_MORE;
};
var deflate_fast = (s, flush) => {
  let hash_head;
  let bflush;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH) {
      hash_head = INSERT_STRING(s, s.strstart);
    }
    if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
      s.match_length = longest_match(s, hash_head);
    }
    if (s.match_length >= MIN_MATCH) {
      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
      s.lookahead -= s.match_length;
      if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
        s.match_length--;
        do {
          s.strstart++;
          hash_head = INSERT_STRING(s, s.strstart);
        } while (--s.match_length !== 0);
        s.strstart++;
      } else {
        s.strstart += s.match_length;
        s.match_length = 0;
        if (s.legacy_hash) {
          s.ins_h = s.window[s.strstart];
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
        }
      }
    } else {
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
var deflate_slow = (s, flush) => {
  let hash_head;
  let bflush;
  let max_insert;
  for (; ; ) {
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    hash_head = 0;
    if (s.lookahead >= MIN_MATCH) {
      hash_head = INSERT_STRING(s, s.strstart);
    }
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;
    if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
      s.match_length = longest_match(s, hash_head);
      if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
        s.match_length = MIN_MATCH - 1;
      }
    }
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          hash_head = INSERT_STRING(s, s.strstart);
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    } else if (s.match_available) {
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
      if (bflush) {
        flush_block_only(s, false);
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  if (s.match_available) {
    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
var deflate_rle = (s, flush) => {
  let bflush;
  let prev;
  let scan, strend;
  const _win = s.window;
  for (; ; ) {
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      }
    }
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
        } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
    }
    if (s.match_length >= MIN_MATCH) {
      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
var deflate_huff = (s, flush) => {
  let bflush;
  for (; ; ) {
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        break;
      }
    }
    s.match_length = 0;
    bflush = _tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
  }
  return BS_BLOCK_DONE;
};
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}
var configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),
  /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),
  /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),
  /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),
  /* 3 */
  new Config(4, 4, 16, 16, deflate_slow),
  /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),
  /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),
  /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),
  /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),
  /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)
  /* 9 max compression */
];
var lm_init = (s) => {
  s.window_size = 2 * s.w_size;
  zero(s.head);
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;
  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
};
function DeflateState() {
  this.strm = null;
  this.status = 0;
  this.pending_buf = null;
  this.pending_buf_size = 0;
  this.pending_out = 0;
  this.pending = 0;
  this.wrap = 0;
  this.gzhead = null;
  this.gzindex = 0;
  this.method = Z_DEFLATED$2;
  this.last_flush = -1;
  this.w_size = 0;
  this.w_bits = 0;
  this.w_mask = 0;
  this.window = null;
  this.window_size = 0;
  this.prev = null;
  this.head = null;
  this.ins_h = 0;
  this.legacy_hash = 0;
  this.hash_size = 0;
  this.hash_bits = 0;
  this.hash_mask = 0;
  this.hash_shift = 0;
  this.block_start = 0;
  this.match_length = 0;
  this.prev_match = 0;
  this.match_available = 0;
  this.strstart = 0;
  this.match_start = 0;
  this.lookahead = 0;
  this.prev_length = 0;
  this.max_chain_length = 0;
  this.max_lazy_match = 0;
  this.level = 0;
  this.strategy = 0;
  this.good_match = 0;
  this.nice_match = 0;
  this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
  this.dyn_dtree = new Uint16Array((2 * D_CODES + 1) * 2);
  this.bl_tree = new Uint16Array((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);
  this.l_desc = null;
  this.d_desc = null;
  this.bl_desc = null;
  this.bl_count = new Uint16Array(MAX_BITS + 1);
  this.heap = new Uint16Array(2 * L_CODES + 1);
  zero(this.heap);
  this.heap_len = 0;
  this.heap_max = 0;
  this.depth = new Uint16Array(2 * L_CODES + 1);
  zero(this.depth);
  this.sym_buf = 0;
  this.lit_bufsize = 0;
  this.sym_next = 0;
  this.sym_end = 0;
  this.opt_len = 0;
  this.static_len = 0;
  this.matches = 0;
  this.insert = 0;
  this.bi_buf = 0;
  this.bi_valid = 0;
}
var deflateStateCheck = (strm) => {
  if (!strm) {
    return 1;
  }
  const s = strm.state;
  if (!s || s.strm !== strm || s.status !== INIT_STATE && //#ifdef GZIP
  s.status !== GZIP_STATE && //#endif
  s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) {
    return 1;
  }
  return 0;
};
var deflateResetKeep = (strm) => {
  if (deflateStateCheck(strm)) {
    return err(strm, Z_STREAM_ERROR$2);
  }
  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;
  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;
  if (s.wrap < 0) {
    s.wrap = -s.wrap;
  }
  s.status = //#ifdef GZIP
  s.wrap === 2 ? GZIP_STATE : (
    //#endif
    s.wrap ? INIT_STATE : BUSY_STATE
  );
  strm.adler = s.wrap === 2 ? 0 : 1;
  s.last_flush = -2;
  _tr_init(s);
  return Z_OK$3;
};
var deflateReset = (strm) => {
  const ret = deflateResetKeep(strm);
  if (ret === Z_OK$3) {
    lm_init(strm.state);
  }
  return ret;
};
var deflateSetHeader = (strm, head) => {
  if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
    return Z_STREAM_ERROR$2;
  }
  strm.state.gzhead = head;
  return Z_OK$3;
};
var deflateInit2 = (strm, level, method, windowBits, memLevel, strategy, legacyHash) => {
  if (!strm) {
    return Z_STREAM_ERROR$2;
  }
  let wrap = 1;
  if (level === Z_DEFAULT_COMPRESSION$1) {
    level = 6;
  }
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else if (windowBits > 15) {
    wrap = 2;
    windowBits -= 16;
  }
  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED || windowBits === 8 && wrap !== 1) {
    return err(strm, Z_STREAM_ERROR$2);
  }
  if (windowBits === 8) {
    windowBits = 9;
  }
  const s = new DeflateState();
  strm.state = s;
  s.strm = strm;
  s.status = INIT_STATE;
  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;
  s.legacy_hash = legacyHash ? 1 : 0;
  s.hash_bits = memLevel + 7;
  if (!s.legacy_hash && s.hash_bits < 15) {
    s.hash_bits = 15;
  }
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);
  s.lit_bufsize = 1 << memLevel + 6;
  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new Uint8Array(s.pending_buf_size);
  s.sym_buf = s.lit_bufsize;
  s.sym_end = (s.lit_bufsize - 1) * 3;
  s.level = level;
  s.strategy = strategy;
  s.method = method;
  return deflateReset(strm);
};
var deflateInit = (strm, level) => {
  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};
var deflate$2 = (strm, flush) => {
  if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
  }
  const s = strm.state;
  if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== Z_FINISH$3) {
    return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR$2 : Z_STREAM_ERROR$2);
  }
  const old_flush = s.last_flush;
  s.last_flush = flush;
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH$3) {
    return err(strm, Z_BUF_ERROR$2);
  }
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR$2);
  }
  if (s.status === INIT_STATE && s.wrap === 0) {
    s.status = BUSY_STATE;
  }
  if (s.status === INIT_STATE) {
    let header = Z_DEFLATED$2 + (s.w_bits - 8 << 4) << 8;
    let level_flags = -1;
    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
      level_flags = 0;
    } else if (s.level < 6) {
      level_flags = 1;
    } else if (s.level === 6) {
      level_flags = 2;
    } else {
      level_flags = 3;
    }
    header |= level_flags << 6;
    if (s.strstart !== 0) {
      header |= PRESET_DICT;
    }
    header += 31 - header % 31;
    putShortMSB(s, header);
    if (s.strstart !== 0) {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 65535);
    }
    strm.adler = 1;
    s.status = BUSY_STATE;
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
  if (s.status === GZIP_STATE) {
    strm.adler = 0;
    put_byte(s, 31);
    put_byte(s, 139);
    put_byte(s, 8);
    if (!s.gzhead) {
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
      put_byte(s, OS_CODE);
      s.status = BUSY_STATE;
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    } else {
      put_byte(
        s,
        (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
      );
      put_byte(s, s.gzhead.time & 255);
      put_byte(s, s.gzhead.time >> 8 & 255);
      put_byte(s, s.gzhead.time >> 16 & 255);
      put_byte(s, s.gzhead.time >> 24 & 255);
      put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
      put_byte(s, s.gzhead.os & 255);
      if (s.gzhead.extra && s.gzhead.extra.length) {
        put_byte(s, s.gzhead.extra.length & 255);
        put_byte(s, s.gzhead.extra.length >> 8 & 255);
      }
      if (s.gzhead.hcrc) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
      }
      s.gzindex = 0;
      s.status = EXTRA_STATE;
    }
  }
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra) {
      let beg = s.pending;
      let left = (s.gzhead.extra.length & 65535) - s.gzindex;
      while (s.pending + left > s.pending_buf_size) {
        let copy = s.pending_buf_size - s.pending;
        s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
        s.pending = s.pending_buf_size;
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        s.gzindex += copy;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
        beg = 0;
        left -= copy;
      }
      let gzhead_extra = new Uint8Array(s.gzhead.extra);
      s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
      s.pending += left;
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      s.gzindex = 0;
    }
    s.status = NAME_STATE;
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name) {
      let beg = s.pending;
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      s.gzindex = 0;
    }
    s.status = COMMENT_STATE;
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment) {
      let beg = s.pending;
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
    }
    s.status = HCRC_STATE;
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
      put_byte(s, strm.adler & 255);
      put_byte(s, strm.adler >> 8 & 255);
      strm.adler = 0;
    }
    s.status = BUSY_STATE;
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
  if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE) {
    let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
      }
      return Z_OK$3;
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align(s);
      } else if (flush !== Z_BLOCK$1) {
        _tr_stored_block(s, 0, 0, false);
        if (flush === Z_FULL_FLUSH$1) {
          zero(s.head);
          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
  }
  if (flush !== Z_FINISH$3) {
    return Z_OK$3;
  }
  if (s.wrap <= 0) {
    return Z_STREAM_END$3;
  }
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 255);
    put_byte(s, strm.adler >> 8 & 255);
    put_byte(s, strm.adler >> 16 & 255);
    put_byte(s, strm.adler >> 24 & 255);
    put_byte(s, strm.total_in & 255);
    put_byte(s, strm.total_in >> 8 & 255);
    put_byte(s, strm.total_in >> 16 & 255);
    put_byte(s, strm.total_in >> 24 & 255);
  } else {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 65535);
  }
  flush_pending(strm);
  if (s.wrap > 0) {
    s.wrap = -s.wrap;
  }
  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};
var deflateEnd = (strm) => {
  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }
  const status2 = strm.state.status;
  strm.state = null;
  return status2 === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};
var deflateSetDictionary = (strm, dictionary) => {
  let dictLength = dictionary.length;
  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }
  const s = strm.state;
  const wrap = s.wrap;
  if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
    return Z_STREAM_ERROR$2;
  }
  if (wrap === 1) {
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }
  s.wrap = 0;
  if (dictLength >= s.w_size) {
    if (wrap === 0) {
      zero(s.head);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH - 1);
    do {
      INSERT_STRING(s, str);
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$3;
};
var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2$1 = deflate$2;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = "pako deflate (from Nodeca project)";
var deflate_1$2 = {
  deflateInit: deflateInit_1,
  deflateInit2: deflateInit2_1,
  deflateReset: deflateReset_1,
  deflateResetKeep: deflateResetKeep_1,
  deflateSetHeader: deflateSetHeader_1,
  deflate: deflate_2$1,
  deflateEnd: deflateEnd_1,
  deflateSetDictionary: deflateSetDictionary_1,
  deflateInfo
};
var _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
var assign = function(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) {
      continue;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be non-object");
    }
    for (const p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }
  return obj;
};
var flattenChunks = (chunks) => {
  let len = 0;
  for (let i2 = 0, l = chunks.length; i2 < l; i2++) {
    len += chunks[i2].length;
  }
  const result = new Uint8Array(len);
  for (let i2 = 0, pos = 0, l = chunks.length; i2 < l; i2++) {
    let chunk = chunks[i2];
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
};
var common = {
  assign,
  flattenChunks
};
var STR_APPLY_UIA_OK = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (__) {
  STR_APPLY_UIA_OK = false;
}
var _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
}
_utf8len[254] = _utf8len[255] = 1;
var string2buf = (str) => {
  if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }
  let buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
  }
  buf = new Uint8Array(buf_len);
  for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (c2 - 56320);
        m_pos++;
      }
    }
    if (c < 128) {
      buf[i2++] = c;
    } else if (c < 2048) {
      buf[i2++] = 192 | c >>> 6;
      buf[i2++] = 128 | c & 63;
    } else if (c < 65536) {
      buf[i2++] = 224 | c >>> 12;
      buf[i2++] = 128 | c >>> 6 & 63;
      buf[i2++] = 128 | c & 63;
    } else {
      buf[i2++] = 240 | c >>> 18;
      buf[i2++] = 128 | c >>> 12 & 63;
      buf[i2++] = 128 | c >>> 6 & 63;
      buf[i2++] = 128 | c & 63;
    }
  }
  return buf;
};
var buf2binstring = (buf, len) => {
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }
  let result = "";
  for (let i2 = 0; i2 < len; i2++) {
    result += String.fromCharCode(buf[i2]);
  }
  return result;
};
var buf2string = (buf, max) => {
  const len = max || buf.length;
  if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }
  let i2, out;
  const utf16buf = new Array(len * 2);
  for (out = 0, i2 = 0; i2 < len; ) {
    let c = buf[i2++];
    if (c < 128) {
      utf16buf[out++] = c;
      continue;
    }
    let c_len = _utf8len[c];
    if (c_len > 4) {
      utf16buf[out++] = 65533;
      i2 += c_len - 1;
      continue;
    }
    c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
    while (c_len > 1 && i2 < len) {
      c = c << 6 | buf[i2++] & 63;
      c_len--;
    }
    if (c_len > 1) {
      utf16buf[out++] = 65533;
      continue;
    }
    if (c < 65536) {
      utf16buf[out++] = c;
    } else {
      c -= 65536;
      utf16buf[out++] = 55296 | c >> 10 & 1023;
      utf16buf[out++] = 56320 | c & 1023;
    }
  }
  return buf2binstring(utf16buf, out);
};
var utf8border = (buf, max) => {
  max = max || buf.length;
  if (max > buf.length) {
    max = buf.length;
  }
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 192) === 128) {
    pos--;
  }
  if (pos < 0) {
    return max;
  }
  if (pos === 0) {
    return max;
  }
  return pos + _utf8len[buf[pos]] > max ? pos : max;
};
var strings = {
  string2buf,
  buf2string,
  utf8border
};
function ZStream() {
  this.input = null;
  this.next_in = 0;
  this.avail_in = 0;
  this.total_in = 0;
  this.output = null;
  this.next_out = 0;
  this.avail_out = 0;
  this.total_out = 0;
  this.msg = "";
  this.state = null;
  this.data_type = 2;
  this.adler = 0;
}
var zstream = ZStream;
var toString$1 = Object.prototype.toString;
var {
  Z_NO_FLUSH: Z_NO_FLUSH$1,
  Z_SYNC_FLUSH,
  Z_FULL_FLUSH,
  Z_FINISH: Z_FINISH$2,
  Z_OK: Z_OK$2,
  Z_STREAM_END: Z_STREAM_END$2,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFLATED: Z_DEFLATED$1
} = constants$2;
var defaultOptions$1 = {
  level: Z_DEFAULT_COMPRESSION,
  method: Z_DEFLATED$1,
  chunkSize: 16384,
  windowBits: 15,
  memLevel: 8,
  strategy: Z_DEFAULT_STRATEGY,
  legacyHash: true
};
function Deflate$1(options) {
  this.options = common.assign({}, defaultOptions$1, options || {});
  let opt = this.options;
  if (opt.raw && opt.windowBits > 0) {
    opt.windowBits = -opt.windowBits;
  } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
    opt.windowBits += 16;
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status2 = deflate_1$2.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy,
    opt.legacyHash
  );
  if (status2 !== Z_OK$2) {
    throw new Error(messages[status2]);
  }
  if (opt.header) {
    deflate_1$2.deflateSetHeader(this.strm, opt.header);
  }
  if (opt.dictionary) {
    let dict;
    if (typeof opt.dictionary === "string") {
      dict = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }
    status2 = deflate_1$2.deflateSetDictionary(this.strm, dict);
    if (status2 !== Z_OK$2) {
      throw new Error(messages[status2]);
    }
    this._dict_set = true;
  }
}
Deflate$1.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status2, _flush_mode;
  if (this.ended) {
    return false;
  }
  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;
  if (typeof data === "string") {
    strm.input = strings.string2buf(data);
  } else if (toString$1.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    status2 = deflate_1$2.deflate(strm, _flush_mode);
    if (status2 === Z_STREAM_END$2) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status2 = deflate_1$2.deflateEnd(this.strm);
      this.onEnd(status2);
      this.ended = true;
      return status2 === Z_OK$2;
    }
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }
    if (strm.avail_in === 0) break;
  }
  return true;
};
Deflate$1.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Deflate$1.prototype.onEnd = function(status2) {
  if (status2 === Z_OK$2) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status2;
  this.msg = this.strm.msg;
};
function deflate$1(input, options) {
  const deflator = new Deflate$1(options);
  deflator.push(input, true);
  if (deflator.err) {
    throw deflator.msg || messages[deflator.err];
  }
  return deflator.result;
}
function deflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}
function gzip$1(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}
var Deflate_1$1 = Deflate$1;
var deflate_2 = deflate$1;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;
var constants$1 = constants$2;
var deflate_1$1 = {
  Deflate: Deflate_1$1,
  deflate: deflate_2,
  deflateRaw: deflateRaw_1$1,
  gzip: gzip_1$1,
  constants: constants$1
};
var BAD$1 = 16209;
var TYPE$1 = 16191;
var inffast = function inflate_fast(strm, start) {
  let _in;
  let last;
  let _out;
  let beg;
  let end;
  let dmax;
  let wsize;
  let whave;
  let wnext;
  let s_window;
  let hold;
  let bits;
  let lcode;
  let dcode;
  let lmask;
  let dmask;
  let here;
  let op;
  let len;
  let dist;
  let from;
  let from_source;
  let input, output;
  const state = strm.state;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
  dmax = state.dmax;
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;
  top:
    do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }
      here = lcode[hold & lmask];
      dolen:
        for (; ; ) {
          op = here >>> 24;
          hold >>>= op;
          bits -= op;
          op = here >>> 16 & 255;
          if (op === 0) {
            output[_out++] = here & 65535;
          } else if (op & 16) {
            len = here & 65535;
            op &= 15;
            if (op) {
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
              len += hold & (1 << op) - 1;
              hold >>>= op;
              bits -= op;
            }
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = dcode[hold & dmask];
            dodist:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op & 16) {
                  dist = here & 65535;
                  op &= 15;
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                  }
                  dist += hold & (1 << op) - 1;
                  if (dist > dmax) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD$1;
                    break top;
                  }
                  hold >>>= op;
                  bits -= op;
                  op = _out - beg;
                  if (dist > op) {
                    op = dist - op;
                    if (op > whave) {
                      if (state.sane) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD$1;
                        break top;
                      }
                    }
                    from = 0;
                    from_source = s_window;
                    if (wnext === 0) {
                      from += wsize - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    } else if (wnext < op) {
                      from += wsize + wnext - op;
                      op -= wnext;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = 0;
                        if (wnext < len) {
                          op = wnext;
                          len -= op;
                          do {
                            output[_out++] = s_window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                    } else {
                      from += wnext - op;
                      if (op < len) {
                        len -= op;
                        do {
                          output[_out++] = s_window[from++];
                        } while (--op);
                        from = _out - dist;
                        from_source = output;
                      }
                    }
                    while (len > 2) {
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      output[_out++] = from_source[from++];
                      len -= 3;
                    }
                    if (len) {
                      output[_out++] = from_source[from++];
                      if (len > 1) {
                        output[_out++] = from_source[from++];
                      }
                    }
                  } else {
                    from = _out - dist;
                    do {
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      output[_out++] = output[from++];
                      len -= 3;
                    } while (len > 2);
                    if (len) {
                      output[_out++] = output[from++];
                      if (len > 1) {
                        output[_out++] = output[from++];
                      }
                    }
                  }
                } else if ((op & 64) === 0) {
                  here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dodist;
                } else {
                  strm.msg = "invalid distance code";
                  state.mode = BAD$1;
                  break top;
                }
                break;
              }
          } else if ((op & 64) === 0) {
            here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
            continue dolen;
          } else if (op & 32) {
            state.mode = TYPE$1;
            break top;
          } else {
            strm.msg = "invalid literal/length code";
            state.mode = BAD$1;
            break top;
          }
          break;
        }
    } while (_in < last && _out < end);
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
  strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
  state.hold = hold;
  state.bits = bits;
  return;
};
var MAXBITS = 15;
var ENOUGH_LENS$1 = 852;
var ENOUGH_DISTS$1 = 592;
var CODES$1 = 0;
var LENS$1 = 1;
var DISTS$1 = 2;
var lbase = new Uint16Array([
  /* Length codes 257..285 base */
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
]);
var lext = new Uint8Array([
  /* Length codes 257..285 extra */
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  199,
  75
]);
var dbase = new Uint16Array([
  /* Distance codes 0..29 base */
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
]);
var dext = new Uint8Array([
  /* Distance codes 0..29 extra */
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
]);
var inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
  const bits = opts.bits;
  let len = 0;
  let sym = 0;
  let min = 0, max = 0;
  let root = 0;
  let curr = 0;
  let drop = 0;
  let left = 0;
  let used = 0;
  let huff = 0;
  let incr;
  let fill;
  let low;
  let mask;
  let next;
  let base = null;
  let match;
  const count = new Uint16Array(MAXBITS + 1);
  const offs = new Uint16Array(MAXBITS + 1);
  let extra = null;
  let here_bits, here_op, here_val;
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) {
      break;
    }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    table[table_index++] = 1 << 24 | 64 << 16 | 0;
    opts.bits = 1;
    return 0;
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) {
      break;
    }
  }
  if (root < min) {
    root = min;
  }
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }
  }
  if (left > 0 && (type === CODES$1 || max !== 1)) {
    return -1;
  }
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }
  if (type === CODES$1) {
    base = extra = work;
    match = 20;
  } else if (type === LENS$1) {
    base = lbase;
    extra = lext;
    match = 257;
  } else {
    base = dbase;
    extra = dext;
    match = 0;
  }
  huff = 0;
  sym = 0;
  len = min;
  next = table_index;
  curr = root;
  drop = 0;
  low = -1;
  used = 1 << root;
  mask = used - 1;
  if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) {
    return 1;
  }
  for (; ; ) {
    here_bits = len - drop;
    if (work[sym] + 1 < match) {
      here_op = 0;
      here_val = work[sym];
    } else if (work[sym] >= match) {
      here_op = extra[work[sym] - match];
      here_val = base[work[sym] - match];
    } else {
      here_op = 32 + 64;
      here_val = 0;
    }
    incr = 1 << len - drop;
    fill = 1 << curr;
    min = fill;
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
    } while (fill !== 0);
    incr = 1 << len - 1;
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }
    sym++;
    if (--count[len] === 0) {
      if (len === max) {
        break;
      }
      len = lens[lens_index + work[sym]];
    }
    if (len > root && (huff & mask) !== low) {
      if (drop === 0) {
        drop = root;
      }
      next += min;
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) {
          break;
        }
        curr++;
        left <<= 1;
      }
      used += 1 << curr;
      if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) {
        return 1;
      }
      low = huff & mask;
      table[low] = root << 24 | curr << 16 | next - table_index | 0;
    }
  }
  if (huff !== 0) {
    table[next + huff] = len - drop << 24 | 64 << 16 | 0;
  }
  opts.bits = root;
  return 0;
};
var inftrees = inflate_table;
var CODES = 0;
var LENS = 1;
var DISTS = 2;
var {
  Z_FINISH: Z_FINISH$1,
  Z_BLOCK,
  Z_TREES,
  Z_OK: Z_OK$1,
  Z_STREAM_END: Z_STREAM_END$1,
  Z_NEED_DICT: Z_NEED_DICT$1,
  Z_STREAM_ERROR: Z_STREAM_ERROR$1,
  Z_DATA_ERROR: Z_DATA_ERROR$1,
  Z_MEM_ERROR: Z_MEM_ERROR$1,
  Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFLATED
} = constants$2;
var HEAD = 16180;
var FLAGS = 16181;
var TIME = 16182;
var OS = 16183;
var EXLEN = 16184;
var EXTRA = 16185;
var NAME = 16186;
var COMMENT = 16187;
var HCRC = 16188;
var DICTID = 16189;
var DICT = 16190;
var TYPE = 16191;
var TYPEDO = 16192;
var STORED = 16193;
var COPY_ = 16194;
var COPY = 16195;
var TABLE = 16196;
var LENLENS = 16197;
var CODELENS = 16198;
var LEN_ = 16199;
var LEN = 16200;
var LENEXT = 16201;
var DIST = 16202;
var DISTEXT = 16203;
var MATCH = 16204;
var LIT = 16205;
var CHECK = 16206;
var LENGTH = 16207;
var DONE = 16208;
var BAD = 16209;
var MEM = 16210;
var SYNC = 16211;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
var MAX_WBITS = 15;
var DEF_WBITS = MAX_WBITS;
var zswap32 = (q) => {
  return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
};
function InflateState() {
  this.strm = null;
  this.mode = 0;
  this.last = false;
  this.wrap = 0;
  this.havedict = false;
  this.flags = 0;
  this.dmax = 0;
  this.check = 0;
  this.total = 0;
  this.head = null;
  this.wbits = 0;
  this.wsize = 0;
  this.whave = 0;
  this.wnext = 0;
  this.window = null;
  this.hold = 0;
  this.bits = 0;
  this.length = 0;
  this.offset = 0;
  this.extra = 0;
  this.lencode = null;
  this.distcode = null;
  this.lenbits = 0;
  this.distbits = 0;
  this.ncode = 0;
  this.nlen = 0;
  this.ndist = 0;
  this.have = 0;
  this.next = null;
  this.lens = new Uint16Array(320);
  this.work = new Uint16Array(288);
  this.lendyn = null;
  this.distdyn = null;
  this.sane = 0;
  this.back = 0;
  this.was = 0;
}
var inflateStateCheck = (strm) => {
  if (!strm) {
    return 1;
  }
  const state = strm.state;
  if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) {
    return 1;
  }
  return 0;
};
var inflateResetKeep = (strm) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = "";
  if (state.wrap) {
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.flags = -1;
  state.dmax = 32768;
  state.head = null;
  state.hold = 0;
  state.bits = 0;
  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
  state.sane = 1;
  state.back = -1;
  return Z_OK$1;
};
var inflateReset = (strm) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);
};
var inflateReset2 = (strm, windowBits) => {
  let wrap;
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else {
    wrap = (windowBits >> 4) + 5;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
};
var inflateInit2 = (strm, windowBits) => {
  if (!strm) {
    return Z_STREAM_ERROR$1;
  }
  const state = new InflateState();
  strm.state = state;
  state.strm = strm;
  state.window = null;
  state.mode = HEAD;
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$1) {
    strm.state = null;
  }
  return ret;
};
var inflateInit = (strm) => {
  return inflateInit2(strm, DEF_WBITS);
};
var virgin = true;
var lenfix;
var distfix;
var fixedtables = (state) => {
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);
    let sym = 0;
    while (sym < 144) {
      state.lens[sym++] = 8;
    }
    while (sym < 256) {
      state.lens[sym++] = 9;
    }
    while (sym < 280) {
      state.lens[sym++] = 7;
    }
    while (sym < 288) {
      state.lens[sym++] = 8;
    }
    inftrees(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
    sym = 0;
    while (sym < 32) {
      state.lens[sym++] = 5;
    }
    inftrees(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
    virgin = false;
  }
  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
};
var updatewindow = (strm, src, end, copy) => {
  let dist;
  const state = strm.state;
  if (state.window === null) {
    state.window = new Uint8Array(1 << state.wbits);
  }
  if (state.wsize === 0) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;
  }
  if (copy >= state.wsize) {
    state.window.set(src.subarray(end - state.wsize, end), 0);
    state.wnext = 0;
    state.whave = state.wsize;
  } else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
    copy -= dist;
    if (copy) {
      state.window.set(src.subarray(end - copy, end), 0);
      state.wnext = copy;
      state.whave = state.wsize;
    } else {
      state.wnext += dist;
      if (state.wnext === state.wsize) {
        state.wnext = 0;
      }
      if (state.whave < state.wsize) {
        state.whave += dist;
      }
    }
  }
  return 0;
};
var inflate$2 = (strm, flush) => {
  let state;
  let input, output;
  let next;
  let put;
  let have, left;
  let hold;
  let bits;
  let _in, _out;
  let copy;
  let from;
  let from_source;
  let here = 0;
  let here_bits, here_op, here_val;
  let last_bits, last_op, last_val;
  let len;
  let ret;
  const hbuf = new Uint8Array(4);
  let opts;
  let n;
  const order = (
    /* permutation of code lengths */
    new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])
  );
  if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) {
    return Z_STREAM_ERROR$1;
  }
  state = strm.state;
  if (state.mode === TYPE) {
    state.mode = TYPEDO;
  }
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  _in = have;
  _out = left;
  ret = Z_OK$1;
  inf_leave:
    for (; ; ) {
      switch (state.mode) {
        case HEAD:
          if (state.wrap === 0) {
            state.mode = TYPEDO;
            break;
          }
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.wrap & 2 && hold === 35615) {
            if (state.wbits === 0) {
              state.wbits = 15;
            }
            state.check = 0;
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            hold = 0;
            bits = 0;
            state.mode = FLAGS;
            break;
          }
          if (state.head) {
            state.head.done = false;
          }
          if (!(state.wrap & 1) || /* check if zlib header allowed */
          (((hold & 255) << 8) + (hold >> 8)) % 31) {
            strm.msg = "incorrect header check";
            state.mode = BAD;
            break;
          }
          if ((hold & 15) !== Z_DEFLATED) {
            strm.msg = "unknown compression method";
            state.mode = BAD;
            break;
          }
          hold >>>= 4;
          bits -= 4;
          len = (hold & 15) + 8;
          if (state.wbits === 0) {
            state.wbits = len;
          }
          if (len > 15 || len > state.wbits) {
            strm.msg = "invalid window size";
            state.mode = BAD;
            break;
          }
          state.dmax = 1 << state.wbits;
          state.flags = 0;
          strm.adler = state.check = 1;
          state.mode = hold & 512 ? DICTID : TYPE;
          hold = 0;
          bits = 0;
          break;
        case FLAGS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.flags = hold;
          if ((state.flags & 255) !== Z_DEFLATED) {
            strm.msg = "unknown compression method";
            state.mode = BAD;
            break;
          }
          if (state.flags & 57344) {
            strm.msg = "unknown header flags set";
            state.mode = BAD;
            break;
          }
          if (state.head) {
            state.head.text = hold >> 8 & 1;
          }
          if (state.flags & 512 && state.wrap & 4) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = TIME;
        /* falls through */
        case TIME:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.head) {
            state.head.time = hold;
          }
          if (state.flags & 512 && state.wrap & 4) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            hbuf[2] = hold >>> 16 & 255;
            hbuf[3] = hold >>> 24 & 255;
            state.check = crc32_1(state.check, hbuf, 4, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = OS;
        /* falls through */
        case OS:
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.head) {
            state.head.xflags = hold & 255;
            state.head.os = hold >> 8;
          }
          if (state.flags & 512 && state.wrap & 4) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32_1(state.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
          state.mode = EXLEN;
        /* falls through */
        case EXLEN:
          if (state.flags & 1024) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.length = hold;
            if (state.head) {
              state.head.extra_len = hold;
            }
            if (state.flags & 512 && state.wrap & 4) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
          } else if (state.head) {
            state.head.extra = null;
          }
          state.mode = EXTRA;
        /* falls through */
        case EXTRA:
          if (state.flags & 1024) {
            copy = state.length;
            if (copy > have) {
              copy = have;
            }
            if (copy) {
              if (state.head) {
                len = state.head.extra_len - state.length;
                if (!state.head.extra) {
                  state.head.extra = new Uint8Array(state.head.extra_len);
                }
                state.head.extra.set(
                  input.subarray(
                    next,
                    // extra field is limited to 65536 bytes
                    // - no need for additional size check
                    next + copy
                  ),
                  /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                  len
                );
              }
              if (state.flags & 512 && state.wrap & 4) {
                state.check = crc32_1(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              state.length -= copy;
            }
            if (state.length) {
              break inf_leave;
            }
          }
          state.length = 0;
          state.mode = NAME;
        /* falls through */
        case NAME:
          if (state.flags & 2048) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state.head && len && state.length < 65536) {
                state.head.name += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state.flags & 512 && state.wrap & 4) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.name = null;
          }
          state.length = 0;
          state.mode = COMMENT;
        /* falls through */
        case COMMENT:
          if (state.flags & 4096) {
            if (have === 0) {
              break inf_leave;
            }
            copy = 0;
            do {
              len = input[next + copy++];
              if (state.head && len && state.length < 65536) {
                state.head.comment += String.fromCharCode(len);
              }
            } while (len && copy < have);
            if (state.flags & 512 && state.wrap & 4) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            if (len) {
              break inf_leave;
            }
          } else if (state.head) {
            state.head.comment = null;
          }
          state.mode = HCRC;
        /* falls through */
        case HCRC:
          if (state.flags & 512) {
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.wrap & 4 && hold !== (state.check & 65535)) {
              strm.msg = "header crc mismatch";
              state.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          if (state.head) {
            state.head.hcrc = state.flags >> 9 & 1;
            state.head.done = true;
          }
          strm.adler = state.check = 0;
          state.mode = TYPE;
          break;
        case DICTID:
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          strm.adler = state.check = zswap32(hold);
          hold = 0;
          bits = 0;
          state.mode = DICT;
        /* falls through */
        case DICT:
          if (state.havedict === 0) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            return Z_NEED_DICT$1;
          }
          strm.adler = state.check = 1;
          state.mode = TYPE;
        /* falls through */
        case TYPE:
          if (flush === Z_BLOCK || flush === Z_TREES) {
            break inf_leave;
          }
        /* falls through */
        case TYPEDO:
          if (state.last) {
            hold >>>= bits & 7;
            bits -= bits & 7;
            state.mode = CHECK;
            break;
          }
          while (bits < 3) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.last = hold & 1;
          hold >>>= 1;
          bits -= 1;
          switch (hold & 3) {
            case 0:
              state.mode = STORED;
              break;
            case 1:
              fixedtables(state);
              state.mode = LEN_;
              if (flush === Z_TREES) {
                hold >>>= 2;
                bits -= 2;
                break inf_leave;
              }
              break;
            case 2:
              state.mode = TABLE;
              break;
            case 3:
              strm.msg = "invalid block type";
              state.mode = BAD;
          }
          hold >>>= 2;
          bits -= 2;
          break;
        case STORED:
          hold >>>= bits & 7;
          bits -= bits & 7;
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
            strm.msg = "invalid stored block lengths";
            state.mode = BAD;
            break;
          }
          state.length = hold & 65535;
          hold = 0;
          bits = 0;
          state.mode = COPY_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        /* falls through */
        case COPY_:
          state.mode = COPY;
        /* falls through */
        case COPY:
          copy = state.length;
          if (copy) {
            if (copy > have) {
              copy = have;
            }
            if (copy > left) {
              copy = left;
            }
            if (copy === 0) {
              break inf_leave;
            }
            output.set(input.subarray(next, next + copy), put);
            have -= copy;
            next += copy;
            left -= copy;
            put += copy;
            state.length -= copy;
            break;
          }
          state.mode = TYPE;
          break;
        case TABLE:
          while (bits < 14) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.nlen = (hold & 31) + 257;
          hold >>>= 5;
          bits -= 5;
          state.ndist = (hold & 31) + 1;
          hold >>>= 5;
          bits -= 5;
          state.ncode = (hold & 15) + 4;
          hold >>>= 4;
          bits -= 4;
          if (state.nlen > 286 || state.ndist > 30) {
            strm.msg = "too many length or distance symbols";
            state.mode = BAD;
            break;
          }
          state.have = 0;
          state.mode = LENLENS;
        /* falls through */
        case LENLENS:
          while (state.have < state.ncode) {
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.lens[order[state.have++]] = hold & 7;
            hold >>>= 3;
            bits -= 3;
          }
          while (state.have < 19) {
            state.lens[order[state.have++]] = 0;
          }
          state.lencode = state.lendyn;
          state.lenbits = 7;
          opts = { bits: state.lenbits };
          ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
          state.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid code lengths set";
            state.mode = BAD;
            break;
          }
          state.have = 0;
          state.mode = CODELENS;
        /* falls through */
        case CODELENS:
          while (state.have < state.nlen + state.ndist) {
            for (; ; ) {
              here = state.lencode[hold & (1 << state.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_val < 16) {
              hold >>>= here_bits;
              bits -= here_bits;
              state.lens[state.have++] = here_val;
            } else {
              if (here_val === 16) {
                n = here_bits + 2;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                if (state.have === 0) {
                  strm.msg = "invalid bit length repeat";
                  state.mode = BAD;
                  break;
                }
                len = state.lens[state.have - 1];
                copy = 3 + (hold & 3);
                hold >>>= 2;
                bits -= 2;
              } else if (here_val === 17) {
                n = here_bits + 3;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 3 + (hold & 7);
                hold >>>= 3;
                bits -= 3;
              } else {
                n = here_bits + 7;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                len = 0;
                copy = 11 + (hold & 127);
                hold >>>= 7;
                bits -= 7;
              }
              if (state.have + copy > state.nlen + state.ndist) {
                strm.msg = "invalid bit length repeat";
                state.mode = BAD;
                break;
              }
              while (copy--) {
                state.lens[state.have++] = len;
              }
            }
          }
          if (state.mode === BAD) {
            break;
          }
          if (state.lens[256] === 0) {
            strm.msg = "invalid code -- missing end-of-block";
            state.mode = BAD;
            break;
          }
          state.lenbits = 9;
          opts = { bits: state.lenbits };
          ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
          state.lenbits = opts.bits;
          if (ret) {
            strm.msg = "invalid literal/lengths set";
            state.mode = BAD;
            break;
          }
          state.distbits = 6;
          state.distcode = state.distdyn;
          opts = { bits: state.distbits };
          ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
          state.distbits = opts.bits;
          if (ret) {
            strm.msg = "invalid distances set";
            state.mode = BAD;
            break;
          }
          state.mode = LEN_;
          if (flush === Z_TREES) {
            break inf_leave;
          }
        /* falls through */
        case LEN_:
          state.mode = LEN;
        /* falls through */
        case LEN:
          if (have >= 6 && left >= 258) {
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            inffast(strm, _out);
            put = strm.next_out;
            output = strm.output;
            left = strm.avail_out;
            next = strm.next_in;
            input = strm.input;
            have = strm.avail_in;
            hold = state.hold;
            bits = state.bits;
            if (state.mode === TYPE) {
              state.back = -1;
            }
            break;
          }
          state.back = 0;
          for (; ; ) {
            here = state.lencode[hold & (1 << state.lenbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (here_op && (here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state.back += here_bits;
          state.length = here_val;
          if (here_op === 0) {
            state.mode = LIT;
            break;
          }
          if (here_op & 32) {
            state.back = -1;
            state.mode = TYPE;
            break;
          }
          if (here_op & 64) {
            strm.msg = "invalid literal/length code";
            state.mode = BAD;
            break;
          }
          state.extra = here_op & 15;
          state.mode = LENEXT;
        /* falls through */
        case LENEXT:
          if (state.extra) {
            n = state.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.length += hold & (1 << state.extra) - 1;
            hold >>>= state.extra;
            bits -= state.extra;
            state.back += state.extra;
          }
          state.was = state.length;
          state.mode = DIST;
        /* falls through */
        case DIST:
          for (; ; ) {
            here = state.distcode[hold & (1 << state.distbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) {
              break;
            }
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if ((here_op & 240) === 0) {
            last_bits = here_bits;
            last_op = here_op;
            last_val = here_val;
            for (; ; ) {
              here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (last_bits + here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            hold >>>= last_bits;
            bits -= last_bits;
            state.back += last_bits;
          }
          hold >>>= here_bits;
          bits -= here_bits;
          state.back += here_bits;
          if (here_op & 64) {
            strm.msg = "invalid distance code";
            state.mode = BAD;
            break;
          }
          state.offset = here_val;
          state.extra = here_op & 15;
          state.mode = DISTEXT;
        /* falls through */
        case DISTEXT:
          if (state.extra) {
            n = state.extra;
            while (bits < n) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.offset += hold & (1 << state.extra) - 1;
            hold >>>= state.extra;
            bits -= state.extra;
            state.back += state.extra;
          }
          if (state.offset > state.dmax) {
            strm.msg = "invalid distance too far back";
            state.mode = BAD;
            break;
          }
          state.mode = MATCH;
        /* falls through */
        case MATCH:
          if (left === 0) {
            break inf_leave;
          }
          copy = _out - left;
          if (state.offset > copy) {
            copy = state.offset - copy;
            if (copy > state.whave) {
              if (state.sane) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break;
              }
            }
            if (copy > state.wnext) {
              copy -= state.wnext;
              from = state.wsize - copy;
            } else {
              from = state.wnext - copy;
            }
            if (copy > state.length) {
              copy = state.length;
            }
            from_source = state.window;
          } else {
            from_source = output;
            from = put - state.offset;
            copy = state.length;
          }
          if (copy > left) {
            copy = left;
          }
          left -= copy;
          state.length -= copy;
          do {
            output[put++] = from_source[from++];
          } while (--copy);
          if (state.length === 0) {
            state.mode = LEN;
          }
          break;
        case LIT:
          if (left === 0) {
            break inf_leave;
          }
          output[put++] = state.length;
          left--;
          state.mode = LEN;
          break;
        case CHECK:
          if (state.wrap) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold |= input[next++] << bits;
              bits += 8;
            }
            _out -= left;
            strm.total_out += _out;
            state.total += _out;
            if (state.wrap & 4 && _out) {
              strm.adler = state.check = /*UPDATE_CHECK(state.check, put - _out, _out);*/
              state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out);
            }
            _out = left;
            if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
              strm.msg = "incorrect data check";
              state.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state.mode = LENGTH;
        /* falls through */
        case LENGTH:
          if (state.wrap && state.flags) {
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
              strm.msg = "incorrect length check";
              state.mode = BAD;
              break;
            }
            hold = 0;
            bits = 0;
          }
          state.mode = DONE;
        /* falls through */
        case DONE:
          ret = Z_STREAM_END$1;
          break inf_leave;
        case BAD:
          ret = Z_DATA_ERROR$1;
          break inf_leave;
        case MEM:
          return Z_MEM_ERROR$1;
        case SYNC:
        /* falls through */
        default:
          return Z_STREAM_ERROR$1;
      }
    }
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH$1)) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap & 4 && _out) {
    strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
    state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out);
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if ((_in === 0 && _out === 0 || flush === Z_FINISH$1) && ret === Z_OK$1) {
    ret = Z_BUF_ERROR$1;
  }
  return ret;
};
var inflateEnd = (strm) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  let state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$1;
};
var inflateGetHeader = (strm, head) => {
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  const state = strm.state;
  if ((state.wrap & 2) === 0) {
    return Z_STREAM_ERROR$1;
  }
  state.head = head;
  head.done = false;
  return Z_OK$1;
};
var inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;
  let state;
  let dictid;
  let ret;
  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }
  state = strm.state;
  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }
  if (state.mode === DICT) {
    dictid = 1;
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR$1;
  }
  state.havedict = 1;
  return Z_OK$1;
};
var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2$1 = inflate$2;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = "pako inflate (from Nodeca project)";
var inflate_1$2 = {
  inflateReset: inflateReset_1,
  inflateReset2: inflateReset2_1,
  inflateResetKeep: inflateResetKeep_1,
  inflateInit: inflateInit_1,
  inflateInit2: inflateInit2_1,
  inflate: inflate_2$1,
  inflateEnd: inflateEnd_1,
  inflateGetHeader: inflateGetHeader_1,
  inflateSetDictionary: inflateSetDictionary_1,
  inflateInfo
};
function GZheader() {
  this.text = 0;
  this.time = 0;
  this.xflags = 0;
  this.os = 0;
  this.extra = null;
  this.extra_len = 0;
  this.name = "";
  this.comment = "";
  this.hcrc = 0;
  this.done = false;
}
var gzheader = GZheader;
var toString = Object.prototype.toString;
var {
  Z_NO_FLUSH,
  Z_FINISH,
  Z_OK,
  Z_STREAM_END,
  Z_NEED_DICT,
  Z_STREAM_ERROR,
  Z_DATA_ERROR,
  Z_MEM_ERROR,
  Z_BUF_ERROR
} = constants$2;
var defaultOptions = {
  chunkSize: 1024 * 64,
  windowBits: 15,
  to: ""
};
function Inflate$1(options) {
  this.options = common.assign({}, defaultOptions, options || {});
  const opt = this.options;
  if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) {
      opt.windowBits = -15;
    }
  }
  if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
    opt.windowBits += 32;
  }
  if (opt.windowBits > 15 && opt.windowBits < 48) {
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new zstream();
  this.strm.avail_out = 0;
  let status2 = inflate_1$2.inflateInit2(
    this.strm,
    opt.windowBits
  );
  if (status2 !== Z_OK) {
    throw new Error(messages[status2]);
  }
  this.header = new gzheader();
  inflate_1$2.inflateGetHeader(this.strm, this.header);
  if (opt.dictionary) {
    if (typeof opt.dictionary === "string") {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) {
      status2 = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
      if (status2 !== Z_OK) {
        throw new Error(messages[status2]);
      }
    }
  }
}
Inflate$1.prototype.push = function(data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status2, _flush_mode, last_avail_out;
  if (this.ended) return false;
  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
  if (toString.call(data) === "[object ArrayBuffer]") {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }
  strm.next_in = 0;
  strm.avail_in = strm.input.length;
  for (; ; ) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status2 = inflate_1$2.inflate(strm, _flush_mode);
    if (status2 === Z_NEED_DICT && dictionary) {
      status2 = inflate_1$2.inflateSetDictionary(strm, dictionary);
      if (status2 === Z_OK) {
        status2 = inflate_1$2.inflate(strm, _flush_mode);
      } else if (status2 === Z_DATA_ERROR) {
        status2 = Z_NEED_DICT;
      }
    }
    while (strm.avail_in > 0 && status2 === Z_STREAM_END && strm.state.wrap & 2 && strm.state.flags !== 0 && strm.input[strm.next_in] !== 0) {
      inflate_1$2.inflateReset(strm);
      status2 = inflate_1$2.inflate(strm, _flush_mode);
    }
    switch (status2) {
      case Z_STREAM_ERROR:
      case Z_DATA_ERROR:
      case Z_NEED_DICT:
      case Z_MEM_ERROR:
        this.onEnd(status2);
        this.ended = true;
        return false;
    }
    last_avail_out = strm.avail_out;
    if (strm.next_out) {
      if (strm.avail_out === 0 || status2 === Z_STREAM_END || _flush_mode > 0) {
        if (this.options.to === "string") {
          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
          this.onData(utf8str);
        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
          strm.avail_out = 0;
          strm.next_out = 0;
        }
      }
    }
    if ((status2 === Z_OK || status2 === Z_BUF_ERROR) && last_avail_out === 0) continue;
    if (status2 === Z_STREAM_END) {
      status2 = inflate_1$2.inflateEnd(this.strm);
      this.onEnd(status2);
      this.ended = true;
      return true;
    }
    if (strm.avail_in === 0) {
      if (_flush_mode === Z_FINISH) {
        status2 = inflate_1$2.inflateEnd(this.strm);
        this.onEnd(status2 === Z_OK ? Z_BUF_ERROR : status2);
        this.ended = true;
        return false;
      }
      break;
    }
  }
  return true;
};
Inflate$1.prototype.onData = function(chunk) {
  this.chunks.push(chunk);
};
Inflate$1.prototype.onEnd = function(status2) {
  if (status2 === Z_OK) {
    if (this.options.to === "string") {
      this.result = this.chunks.join("");
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status2;
  this.msg = this.strm.msg;
};
function inflate$1(input, options) {
  const inflator = new Inflate$1(options);
  inflator.push(input, true);
  if (inflator.err) throw inflator.msg || messages[inflator.err];
  return inflator.result;
}
function inflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}
var Inflate_1$1 = Inflate$1;
var inflate_2 = inflate$1;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip$1 = inflate$1;
var constants = constants$2;
var inflate_1$1 = {
  Inflate: Inflate_1$1,
  inflate: inflate_2,
  inflateRaw: inflateRaw_1$1,
  ungzip: ungzip$1,
  constants
};
var { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;
var { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;
var Inflate_1 = Inflate;

// ../streaming-pdf-reader/dist/index.js
var PdfError = class extends Error {
  code;
  constructor(code, message, options) {
    super(message, options);
    this.name = "PdfError";
    this.code = code;
  }
};
function normalizePdfError(error) {
  if (error instanceof PdfError || error instanceof RangeError) return error;
  const cause = error instanceof Error ? error : void 0;
  const message = cause?.message ?? String(error);
  const code = /configured limit|exceeds configured|max(?:imum)? .*bytes/i.test(message) ? "RESOURCE_LIMIT" : "INVALID_PDF";
  return new PdfError(code, message, cause ? { cause } : void 0);
}
async function httpSource(url, options = {}) {
  const fetcher = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const warn = options.onWarning ?? ((message) => console.warn(message));
  let warnedAboutFullResponse = false;
  const warnAboutFullResponse = () => {
    if (warnedAboutFullResponse) return;
    warnedAboutFullResponse = true;
    warn(
      "HTTP server returned 200 instead of a byte range; reads remain memory-bounded but may transfer extra data"
    );
  };
  const headers = new Headers(options.headers);
  headers.set("range", "bytes=0-0");
  const probe = await fetcher(url, { headers });
  const contentRange = probe.headers.get("content-range");
  const match = /^bytes\s+0-0\/(\d+)$/.exec(contentRange ?? "");
  if (probe.status === 200) {
    warnAboutFullResponse();
    const contentLength = parseContentLength(probe.headers.get("content-length"));
    const size2 = contentLength ?? await countResponseBytes(probe);
    if (contentLength !== void 0) await probe.body?.cancel();
    return fullResponseSource(url, size2, fetcher, options.headers);
  }
  if (probe.status !== 206 || !match?.[1]) {
    await probe.body?.cancel();
    throw new Error("HTTP source must support byte ranges and return a valid Content-Range");
  }
  const size = Number(match[1]);
  const etag = probe.headers.get("etag");
  await probe.arrayBuffer();
  return {
    size,
    async read(offset, length) {
      validateRange(size, offset, length);
      if (length === 0) return new Uint8Array();
      const requestHeaders = new Headers(options.headers);
      requestHeaders.set("range", `bytes=${offset}-${offset + length - 1}`);
      if (etag) requestHeaders.set("if-range", etag);
      const response = await fetcher(url, { headers: requestHeaders });
      if (response.status === 200) {
        warnAboutFullResponse();
        return readResponseSlice(response, offset, length);
      }
      if (response.status !== 206) {
        await response.body?.cancel();
        throw new Error(`range request returned HTTP ${response.status}; expected 200 or 206`);
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength !== length) {
        throw new Error(`range request returned ${bytes.byteLength} bytes; expected ${length}`);
      }
      return bytes;
    }
  };
}
function fullResponseSource(url, size, fetcher, configuredHeaders) {
  return {
    size,
    async read(offset, length) {
      validateRange(size, offset, length);
      if (length === 0) return new Uint8Array();
      const response = await fetcher(url, { headers: new Headers(configuredHeaders) });
      if (response.status !== 200) {
        await response.body?.cancel();
        throw new Error(`full request returned HTTP ${response.status}; expected 200`);
      }
      return readResponseSlice(response, offset, length);
    }
  };
}
async function readResponseSlice(response, offset, length) {
  if (!response.body) throw new Error("HTTP response has no readable body");
  const output = new Uint8Array(length);
  const reader = response.body.getReader();
  const end = offset + length;
  let position = 0;
  let written = 0;
  try {
    while (position < end) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkEnd = position + value.byteLength;
      const copyStart = Math.max(position, offset);
      const copyEnd = Math.min(chunkEnd, end);
      if (copyEnd > copyStart) {
        const sourceStart = copyStart - position;
        output.set(value.subarray(sourceStart, sourceStart + copyEnd - copyStart), written);
        written += copyEnd - copyStart;
      }
      position = chunkEnd;
    }
  } finally {
    await reader.cancel();
  }
  if (written !== length) {
    throw new Error(`full HTTP response ended after ${position} bytes; needed ${end}`);
  }
  return output;
}
async function countResponseBytes(response) {
  if (!response.body) throw new Error("HTTP response has no readable body");
  const reader = response.body.getReader();
  let size = 0;
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) return size;
    size += value.byteLength;
    if (!Number.isSafeInteger(size)) throw new Error("HTTP response is too large");
  }
}
function parseContentLength(value) {
  if (!/^\d+$/.test(value ?? "")) return void 0;
  const size = Number(value);
  return Number.isSafeInteger(size) ? size : void 0;
}
function validateRange(size, offset, length) {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(length) || length < 0 || offset > size || length > size - offset) {
    throw new RangeError(
      `invalid HTTP byte range [${offset}, ${offset + length}) for size ${size}`
    );
  }
}
var decoder = new TextDecoder("latin1");
var ValueParser = class {
  bytes;
  offset;
  constructor(bytes, offset = 0) {
    this.bytes = bytes;
    this.offset = offset;
  }
  parseValue() {
    this.skipSpace();
    const byte = this.bytes[this.offset];
    if (byte === 47) return this.parseName();
    if (byte === 40) return this.parseLiteralString();
    if (byte === 60 && this.bytes[this.offset + 1] === 60) return this.parseDict();
    if (byte === 60) return this.parseHexString();
    if (byte === 91) return this.parseArray();
    if (isNumberStart(byte)) return this.parseNumberOrRef();
    const word = this.readWord();
    if (word === "null") return null;
    if (word === "true") return true;
    if (word === "false") return false;
    if (!word) throw new Error(`expected PDF value at byte ${this.offset}`);
    return word;
  }
  skipSpace() {
    while (this.offset < this.bytes.length) {
      const byte = this.bytes[this.offset];
      if (byte === 37) {
        while (this.offset < this.bytes.length && !isLineEnd(this.bytes[this.offset]))
          this.offset += 1;
      } else if (isWhitespace(byte)) {
        this.offset += 1;
      } else {
        break;
      }
    }
  }
  readWord() {
    this.skipSpace();
    const start = this.offset;
    while (this.offset < this.bytes.length && !isDelimiter(this.bytes[this.offset]))
      this.offset += 1;
    return decoder.decode(this.bytes.subarray(start, this.offset));
  }
  parseNumber() {
    const word = this.readWord();
    const value = Number(word);
    if (!Number.isFinite(value)) throw new Error(`invalid PDF number ${word}`);
    return value;
  }
  parseNumberOrRef() {
    const first = this.parseNumber();
    const afterFirst = this.offset;
    this.skipSpace();
    if (!Number.isInteger(first) || !isNumberStart(this.bytes[this.offset])) {
      this.offset = afterFirst;
      return first;
    }
    const second = this.parseNumber();
    this.skipSpace();
    if (Number.isInteger(second) && this.readWord() === "R") {
      return { type: "ref", object: first, generation: second };
    }
    this.offset = afterFirst;
    return first;
  }
  parseName() {
    this.offset += 1;
    const start = this.offset;
    while (this.offset < this.bytes.length && !isDelimiter(this.bytes[this.offset]))
      this.offset += 1;
    const raw = decoder.decode(this.bytes.subarray(start, this.offset));
    return {
      type: "name",
      value: raw.replace(
        /#([0-9a-f]{2})/gi,
        (_, hex) => String.fromCharCode(Number.parseInt(hex, 16))
      )
    };
  }
  parseLiteralString() {
    this.offset += 1;
    const output = [];
    let depth = 1;
    while (this.offset < this.bytes.length && depth > 0) {
      let byte = this.bytes[this.offset++];
      if (byte === void 0) break;
      if (byte === 92) {
        byte = this.bytes[this.offset++];
        if (byte === void 0) throw new Error("unterminated PDF string escape");
        if (byte === 13 && this.bytes[this.offset] === 10) this.offset += 1;
        if (byte === 13 || byte === 10) continue;
        const escapes = {
          110: 10,
          114: 13,
          116: 9,
          98: 8,
          102: 12
        };
        const escaped = escapes[byte];
        if (escaped !== void 0) {
          output.push(escaped);
        } else if (byte >= 48 && byte <= 55) {
          let octal = String.fromCharCode(byte);
          for (let count = 1; count < 3; count += 1) {
            const next = this.bytes[this.offset];
            if (next === void 0 || next < 48 || next > 55) break;
            octal += String.fromCharCode(next);
            this.offset += 1;
          }
          output.push(Number.parseInt(octal, 8) & 255);
        } else {
          output.push(byte);
        }
      } else if (byte === 40) {
        depth += 1;
        output.push(byte);
      } else if (byte === 41) {
        depth -= 1;
        if (depth > 0) output.push(byte);
      } else {
        output.push(byte);
      }
    }
    if (depth !== 0) throw new Error("unterminated PDF literal string");
    return { type: "string", bytes: Uint8Array.from(output) };
  }
  parseHexString() {
    this.offset += 1;
    let hex = "";
    while (this.offset < this.bytes.length && this.bytes[this.offset] !== 62) {
      const byte = this.bytes[this.offset++];
      if (byte === void 0) break;
      if (!isWhitespace(byte)) hex += String.fromCharCode(byte);
    }
    if (this.bytes[this.offset] !== 62) throw new Error("unterminated PDF hex string");
    this.offset += 1;
    if (hex.length % 2 === 1) hex += "0";
    return {
      type: "string",
      bytes: Uint8Array.from(hex.match(/../g)?.map((value) => Number.parseInt(value, 16)) ?? [])
    };
  }
  parseArray() {
    this.offset += 1;
    const values = [];
    while (true) {
      this.skipSpace();
      if (this.bytes[this.offset] === 93) {
        this.offset += 1;
        return values;
      }
      values.push(this.parseValue());
    }
  }
  parseDict() {
    this.offset += 2;
    const dict = /* @__PURE__ */ new Map();
    while (true) {
      this.skipSpace();
      if (this.bytes[this.offset] === 62 && this.bytes[this.offset + 1] === 62) {
        this.offset += 2;
        return dict;
      }
      const key = this.parseName();
      dict.set(key.value, this.parseValue());
    }
  }
};
function isWhitespace(byte) {
  return byte === 0 || byte === 9 || byte === 10 || byte === 12 || byte === 13 || byte === 32;
}
function isLineEnd(byte) {
  return byte === 10 || byte === 13;
}
function isNumberStart(byte) {
  return byte === 43 || byte === 45 || byte === 46 || byte !== void 0 && byte >= 48 && byte <= 57;
}
function isDelimiter(byte) {
  return byte === void 0 || isWhitespace(byte) || byte === 40 || byte === 41 || byte === 60 || byte === 62 || byte === 91 || byte === 93 || byte === 123 || byte === 125 || byte === 47 || byte === 37;
}
function isRef(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "type" in value && value.type === "ref";
}
function isName(value, name) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "type" in value && value.type === "name" && (name === void 0 || value.value === name);
}
function isDict(value) {
  return value instanceof Map;
}
function isStream(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "type" in value && value.type === "stream";
}
function textFillColor(operator, values) {
  const deviceOperator = operator.toLowerCase();
  if (deviceOperator === "g") {
    const gray = numericTail(values, 1);
    return gray ? rgbHex(gray[0], gray[0], gray[0]) : void 0;
  }
  if (deviceOperator === "rg") {
    const rgb2 = numericTail(values, 3);
    return rgb2 ? rgbHex(rgb2[0], rgb2[1], rgb2[2]) : void 0;
  }
  if (deviceOperator === "k") {
    const cmyk = numericTail(values, 4);
    if (!cmyk) return void 0;
    const [cyan, magenta, yellow, black] = cmyk;
    return rgbHex(
      1 - Math.min(1, cyan + black),
      1 - Math.min(1, magenta + black),
      1 - Math.min(1, yellow + black)
    );
  }
  return void 0;
}
function numericTail(values, length) {
  const tail = values.slice(-length);
  return tail.length === length && tail.every((value) => typeof value === "number") ? tail : void 0;
}
function rgbHex(red, green, blue) {
  return `#${[red, green, blue].map(
    (channel) => Math.round(Math.max(0, Math.min(1, channel)) * 255).toString(16).padStart(2, "0")
  ).join("")}`;
}
async function componentColor(reader, resources, colorSpaceName, components) {
  const model = await colorModel(reader, resources, colorSpaceName);
  if (!model) return void 0;
  return textFillColor(model, components);
}
async function colorModel(reader, resources, name) {
  if (!name) return void 0;
  if (name === "DeviceGray" || name === "G") return "g";
  if (name === "DeviceRGB" || name === "RGB") return "rg";
  if (name === "DeviceCMYK" || name === "CMYK") return "k";
  const spaces = await reader.resolveDict(resources?.get("ColorSpace"));
  const value = spaces?.get(name);
  if (value === void 0) return void 0;
  const resolved = await reader.resolve(value);
  if (isName(resolved)) return colorModel(reader, resources, resolved.value);
  if (!Array.isArray(resolved) || !isName(resolved[0])) return void 0;
  if (resolved[0].value === "ICCBased") {
    const profile = await reader.resolve(resolved[1]);
    if (!isStream(profile)) return void 0;
    return componentModel(profile.dict.get("N"));
  }
  if (resolved[0].value === "CalGray") return "g";
  if (resolved[0].value === "CalRGB" || resolved[0].value === "Lab") return "rg";
  return void 0;
}
function componentModel(count) {
  if (count === 1) return "g";
  if (count === 3) return "rg";
  if (count === 4) return "k";
  return void 0;
}
async function resolveExtendedGraphicsState(reader, resources, name) {
  if (!isName(name)) return void 0;
  const states = await reader.resolveDict(resources?.get("ExtGState"));
  const extended = await reader.resolveDict(states?.get(name.value));
  if (!extended) return void 0;
  const result = {};
  const lineWidth = extended.get("LW");
  if (typeof lineWidth === "number" && lineWidth >= 0) result.lineWidth = lineWidth;
  const lineCap = extended.get("LC");
  if (typeof lineCap === "number" && lineCap >= 0 && lineCap <= 2) result.lineCap = lineCap;
  const lineJoin = extended.get("LJ");
  if (typeof lineJoin === "number" && lineJoin >= 0 && lineJoin <= 2) result.lineJoin = lineJoin;
  const dash = extended.get("D");
  if (Array.isArray(dash) && Array.isArray(dash[0]) && dash[0].every((value) => typeof value === "number" && value >= 0) && typeof dash[1] === "number") {
    result.dashArray = dash[0];
    result.dashPhase = dash[1];
  }
  const fillOpacity = normalizedOpacity(extended.get("ca"));
  const strokeOpacity = normalizedOpacity(extended.get("CA"));
  if (fillOpacity !== void 0) result.fillOpacity = fillOpacity;
  if (strokeOpacity !== void 0) result.strokeOpacity = strokeOpacity;
  const font = extended.get("Font");
  if (!Array.isArray(font) || font.length < 2 || typeof font[1] !== "number") return result;
  const resourceFonts = await reader.resolveDict(resources?.get("Font"));
  for (const [resourceName, value] of resourceFonts ?? []) {
    if (sameReference(value, font[0])) {
      result.fontName = resourceName;
      result.fontSize = font[1];
      break;
    }
  }
  return result;
}
function normalizedOpacity(value) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : void 0;
}
function sameReference(left, right) {
  return isRef(left) && isRef(right) && left.object === right.object && left.generation === right.generation;
}
var identity = [1, 0, 0, 1, 0, 0];
function numericTail2(values, length) {
  const tail = values.slice(-length);
  return tail.length === length && tail.every((value) => typeof value === "number") ? tail : void 0;
}
function pdfMatrix(value) {
  return Array.isArray(value) && value.length === 6 && value.every((item) => typeof item === "number") ? value : void 0;
}
function multiply(left, right) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5]
  ];
}
function transformPoint(matrix, x, y) {
  return [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]];
}
function coordinates([x, y]) {
  return `${number(x)} ${number(y)}`;
}
function number(value) {
  return String(Math.round(value * 1e3) / 1e3);
}
async function shadingColor(reader, resources, name) {
  if (!resources || !isName(name)) return void 0;
  const shadings = await reader.resolveDict(resources.get("Shading"));
  const shading = await reader.resolveDict(shadings?.get(name.value));
  if (shading?.get("ShadingType") !== 2) return void 0;
  const colorSpace = await reader.resolve(shading.get("ColorSpace") ?? null);
  if (!isRgbColorSpace(colorSpace)) return void 0;
  const fn = await reader.resolve(shading.get("Function") ?? null);
  if (isStream(fn)) return sampledColor(reader, fn);
  if (isDict(fn)) return exponentialColor(fn);
  return void 0;
}
async function sampledColor(reader, fn) {
  if (fn.dict.get("FunctionType") !== 0 || fn.dict.get("BitsPerSample") !== 8) return void 0;
  const size = fn.dict.get("Size");
  const sampleCount = Array.isArray(size) && typeof size[0] === "number" ? size[0] : void 0;
  if (!sampleCount || sampleCount < 1) return void 0;
  const bytes = await reader.decodeStream(fn);
  const index = Math.min(sampleCount - 1, Math.floor(sampleCount / 2)) * 3;
  if (index + 2 >= bytes.length) return void 0;
  return rgb(bytes[index] ?? 0, bytes[index + 1] ?? 0, bytes[index + 2] ?? 0);
}
function exponentialColor(fn) {
  if (fn.get("FunctionType") !== 2) return void 0;
  const c0 = numericArray(fn.get("C0")) ?? [0];
  const c1 = numericArray(fn.get("C1")) ?? [1];
  if (c0.length < 3 || c1.length < 3) return void 0;
  return rgb(
    255 * ((c0[0] ?? 0) + (c1[0] ?? 0)) / 2,
    255 * ((c0[1] ?? 0) + (c1[1] ?? 0)) / 2,
    255 * ((c0[2] ?? 0) + (c1[2] ?? 0)) / 2
  );
}
function isRgbColorSpace(value) {
  if (isName(value)) return value.value === "DeviceRGB";
  return Array.isArray(value) && isName(value[0]) && value[0].value === "ICCBased";
}
function numericArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "number") ? value : void 0;
}
function rgb(red, green, blue) {
  return `#${[red, green, blue].map(
    (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")
  ).join("")}`;
}
async function contentStreams(reader, value) {
  if (value === void 0) return [];
  const values = Array.isArray(value) ? value : [value];
  const output = [];
  for (const item of values) {
    const resolved = await reader.resolve(item);
    if (!isStream(resolved)) throw new Error("page /Contents entry is not a stream");
    output.push(await reader.decodeStream(resolved));
  }
  if (output.length <= 1) return output;
  const length = output.reduce((total, bytes) => total + bytes.length + 1, 0);
  if (length > reader.limits.maxDecodedStreamBytes) {
    throw new Error("combined page content exceeds configured decoded stream byte limit");
  }
  const combined = new Uint8Array(length);
  let offset = 0;
  for (const bytes of output) {
    combined.set(bytes, offset);
    offset += bytes.length;
    combined[offset] = 10;
    offset += 1;
  }
  return [combined];
}
var identityMatrix = [1, 0, 0, 1, 0, 0];
function pageOriginMatrix(box) {
  return [1, 0, 0, 1, -box[0], -box[1]];
}
function translate(matrix, x, y) {
  return [
    matrix[0],
    matrix[1],
    matrix[2],
    matrix[3],
    matrix[4] + x * matrix[0] + y * matrix[2],
    matrix[5] + x * matrix[1] + y * matrix[3]
  ];
}
function multiply2(left, right) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5]
  ];
}
function transformPoint2(matrix, x, y) {
  return [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]];
}
function pdfMatrix2(value) {
  if (!Array.isArray(value) || value.length !== 6 || value.some((item) => typeof item !== "number")) {
    return void 0;
  }
  return value;
}
function effectiveLineWidth(matrix, width) {
  const xScale = Math.hypot(matrix[0], matrix[1]);
  const yScale = Math.hypot(matrix[2], matrix[3]);
  return width * (xScale + yScale) / 2;
}
async function extractPageGraphics(reader, page) {
  const fills = [];
  const paths = [];
  const images = [];
  const state = createState();
  state.ctm = pageOriginMatrix(page.mediaBox);
  for (const bytes of await contentStreams(reader, page.dict.get("Contents"))) {
    await interpret(reader, bytes, state, page.resources, fills, paths, images, 0, /* @__PURE__ */ new Set());
  }
  return { fills, paths, images };
}
async function extractGraphicsStream(reader, bytes, resources, initialCtm) {
  const fills = [];
  const paths = [];
  const state = createState();
  state.ctm = [...initialCtm];
  await interpret(reader, bytes, state, resources, fills, paths, [], 0, /* @__PURE__ */ new Set());
  return { fills, paths };
}
function createState() {
  return {
    ctm: [...identity],
    fillColor: "#000000",
    strokeColor: "#000000",
    lineWidth: 1,
    lineCap: 0,
    lineJoin: 0,
    dashArray: [],
    dashPhase: 0,
    fillColorSpace: void 0,
    strokeColorSpace: void 0,
    fillOpacity: 1,
    strokeOpacity: 1,
    clips: [],
    pendingClipRule: void 0,
    stack: [],
    rectangles: [],
    path: [],
    current: void 0,
    start: void 0,
    hasGeneralPath: false
  };
}
async function interpret(reader, bytes, state, resources, fills, paths, images, depth, activeForms) {
  const parser = new ValueParser(bytes);
  const operands = [];
  while (parser.offset < bytes.length) {
    parser.skipSpace();
    if (parser.offset >= bytes.length) break;
    let value;
    try {
      value = parser.parseValue();
    } catch {
      break;
    }
    if (typeof value !== "string") {
      operands.push(value);
      continue;
    }
    await applyOperator(
      value,
      operands,
      reader,
      state,
      resources,
      fills,
      paths,
      images,
      depth,
      activeForms
    );
    operands.length = 0;
  }
}
async function applyOperator(operator, args, reader, state, resources, fills, paths, images, depth, activeForms) {
  if (applyGraphicsState(operator, args, state)) return;
  if (operator === "sc" || operator === "scn") {
    state.fillColor = await componentColor(reader, resources, state.fillColorSpace, args) ?? state.fillColor;
    return;
  }
  if (operator === "SC" || operator === "SCN") {
    state.strokeColor = await componentColor(reader, resources, state.strokeColorSpace, args) ?? state.strokeColor;
    return;
  }
  if (operator === "gs") {
    const extended = await resolveExtendedGraphicsState(reader, resources, args.at(-1));
    if (extended?.lineWidth !== void 0) state.lineWidth = extended.lineWidth;
    if (extended?.lineCap !== void 0) state.lineCap = extended.lineCap;
    if (extended?.lineJoin !== void 0) state.lineJoin = extended.lineJoin;
    if (extended?.dashArray !== void 0) state.dashArray = extended.dashArray;
    if (extended?.dashPhase !== void 0) state.dashPhase = extended.dashPhase;
    if (extended?.fillOpacity !== void 0) state.fillOpacity = extended.fillOpacity;
    if (extended?.strokeOpacity !== void 0) state.strokeOpacity = extended.strokeOpacity;
    return;
  }
  if (applyPathConstruction(operator, args, state)) return;
  if (operator === "W" || operator === "W*") {
    state.pendingClipRule = operator === "W*" ? "evenodd" : "nonzero";
    return;
  }
  if (["f", "F", "f*", "B", "B*", "b", "b*", "S", "s"].includes(operator)) {
    commitClip(state);
    paintPath(operator, state, fills, paths);
    return;
  }
  if (operator === "n") {
    commitClip(state);
    resetPath(state);
    return;
  }
  if (operator === "sh") {
    const color = await shadingColor(reader, resources, args.at(-1));
    const paintClip = state.clips.at(-1);
    if (color && paintClip) {
      paths.push({
        d: paintClip.d,
        fill: color,
        ...state.fillOpacity !== 1 ? { fillOpacity: state.fillOpacity } : {},
        ...state.clips.length > 1 ? { clips: state.clips.slice(0, -1) } : {}
      });
    }
    return;
  }
  if (operator === "Do") {
    await interpretXObject(
      reader,
      args,
      state,
      resources,
      fills,
      paths,
      images,
      depth,
      activeForms
    );
  }
}
function applyGraphicsState(operator, args, state) {
  if (operator === "q") {
    state.stack.push({
      ctm: [...state.ctm],
      fillColor: state.fillColor,
      strokeColor: state.strokeColor,
      lineWidth: state.lineWidth,
      lineCap: state.lineCap,
      lineJoin: state.lineJoin,
      dashArray: [...state.dashArray],
      dashPhase: state.dashPhase,
      fillColorSpace: state.fillColorSpace,
      strokeColorSpace: state.strokeColorSpace,
      fillOpacity: state.fillOpacity,
      strokeOpacity: state.strokeOpacity,
      clips: state.clips.map((clip) => ({ ...clip }))
    });
    return true;
  }
  if (operator === "Q") {
    const restored = state.stack.pop();
    state.ctm = restored?.ctm ?? [...identity];
    state.fillColor = restored?.fillColor ?? "#000000";
    state.strokeColor = restored?.strokeColor ?? "#000000";
    state.lineWidth = restored?.lineWidth ?? 1;
    state.lineCap = restored?.lineCap ?? 0;
    state.lineJoin = restored?.lineJoin ?? 0;
    state.dashArray = restored?.dashArray ?? [];
    state.dashPhase = restored?.dashPhase ?? 0;
    state.fillColorSpace = restored?.fillColorSpace;
    state.strokeColorSpace = restored?.strokeColorSpace;
    state.fillOpacity = restored?.fillOpacity ?? 1;
    state.strokeOpacity = restored?.strokeOpacity ?? 1;
    state.clips = restored?.clips ?? [];
    state.pendingClipRule = void 0;
    return true;
  }
  if (operator === "cm") {
    const matrix = numericTail2(args, 6);
    if (matrix) state.ctm = multiply(state.ctm, matrix);
    return true;
  }
  if (operator === "cs" || operator === "CS") {
    const name = args.at(-1);
    if (isName(name)) {
      if (operator === "cs") state.fillColorSpace = name.value;
      else state.strokeColorSpace = name.value;
    }
    return true;
  }
  if (["g", "rg", "k"].includes(operator)) {
    state.fillColor = textFillColor(operator, args) ?? state.fillColor;
    return true;
  }
  if (["G", "RG", "K"].includes(operator)) {
    state.strokeColor = textFillColor(operator, args) ?? state.strokeColor;
    return true;
  }
  if (operator === "w") {
    const width = numericTail2(args, 1)?.[0];
    if (width !== void 0 && width >= 0) state.lineWidth = width;
    return true;
  }
  if (operator === "J" || operator === "j") {
    const value = numericTail2(args, 1)?.[0];
    if (value !== void 0 && value >= 0 && value <= 2) {
      if (operator === "J") state.lineCap = value;
      else state.lineJoin = value;
    }
    return true;
  }
  if (operator === "d") {
    const array = args.at(-2);
    const phase = args.at(-1);
    if (Array.isArray(array) && array.every((value) => typeof value === "number" && value >= 0) && typeof phase === "number") {
      state.dashArray = array;
      state.dashPhase = phase;
    }
    return true;
  }
  return false;
}
function applyPathConstruction(operator, args, state) {
  if (operator === "m" || operator === "l") {
    const values = numericTail2(args, 2);
    if (values) {
      const point = transformPoint(state.ctm, values[0], values[1]);
      state.path.push(`${operator === "m" ? "M" : "L"}${coordinates(point)}`);
      state.current = point;
      if (operator === "m") state.start = point;
      state.hasGeneralPath = true;
    }
    return true;
  }
  if (operator === "c") {
    const values = numericTail2(args, 6);
    if (values) appendCurve(state, values);
    return true;
  }
  if (operator === "v" || operator === "y") {
    const values = numericTail2(args, 4);
    if (values && state.current) {
      const control = transformPoint(state.ctm, values[0], values[1]);
      const end = transformPoint(state.ctm, values[2], values[3]);
      appendTransformedCurve(
        state,
        operator === "v" ? state.current : control,
        operator === "v" ? control : end,
        end
      );
    }
    return true;
  }
  if (operator === "h") {
    state.path.push("Z");
    state.current = state.start;
    state.hasGeneralPath = true;
    return true;
  }
  if (operator === "re") {
    const rectangle = numericTail2(args, 4);
    if (rectangle) appendRectangle(state, rectangle);
    return true;
  }
  return false;
}
function appendCurve(state, values) {
  appendTransformedCurve(
    state,
    transformPoint(state.ctm, values[0], values[1]),
    transformPoint(state.ctm, values[2], values[3]),
    transformPoint(state.ctm, values[4], values[5])
  );
}
function appendTransformedCurve(state, first, second, end) {
  state.path.push(`C${coordinates(first)} ${coordinates(second)} ${coordinates(end)}`);
  state.current = end;
  state.hasGeneralPath = true;
}
function appendRectangle(state, [x, y, width, height]) {
  const points = [
    transformPoint(state.ctm, x, y),
    transformPoint(state.ctm, x + width, y),
    transformPoint(state.ctm, x + width, y + height),
    transformPoint(state.ctm, x, y + height)
  ];
  state.rectangles.push(points);
  state.path.push(
    `M${coordinates(points[0])}L${coordinates(points[1])}L${coordinates(points[2])}L${coordinates(points[3])}Z`
  );
}
function paintPath(operator, state, fills, paths) {
  const fillsPath = /^(?:f|F|f\*|B|B\*|b|b\*)$/.test(operator);
  const strokesPath = /^(?:S|s|B|B\*|b|b\*)$/.test(operator);
  if (fillsPath && !state.hasGeneralPath) {
    for (const points of state.rectangles) {
      fills.push({
        points,
        color: state.fillColor,
        ...state.fillOpacity !== 1 ? { opacity: state.fillOpacity } : {}
      });
    }
  }
  if (state.path.length > 0 && (state.hasGeneralPath || strokesPath)) {
    paths.push({
      d: state.path.join(""),
      ...fillsPath ? { fill: state.fillColor } : {},
      ...fillsPath && state.fillOpacity !== 1 ? { fillOpacity: state.fillOpacity } : {},
      ...strokesPath ? {
        stroke: state.strokeColor,
        strokeWidth: effectiveLineWidth(state.ctm, state.lineWidth),
        ...state.dashArray.length > 0 ? { strokeDasharray: state.dashArray } : {},
        ...state.dashPhase !== 0 ? { strokeDashoffset: state.dashPhase } : {},
        ...state.lineCap !== 0 ? { strokeLinecap: ["butt", "round", "square"][state.lineCap] } : {},
        ...state.lineJoin !== 0 ? { strokeLinejoin: ["miter", "round", "bevel"][state.lineJoin] } : {}
      } : {},
      ...strokesPath && state.strokeOpacity !== 1 ? { strokeOpacity: state.strokeOpacity } : {},
      ...operator.includes("*") ? { fillRule: "evenodd" } : {},
      ...state.clips.length > 0 ? { clips: state.clips.map((clip) => ({ ...clip })) } : {}
    });
  }
  resetPath(state);
}
function resetPath(state) {
  state.rectangles = [];
  state.path = [];
  state.current = void 0;
  state.start = void 0;
  state.hasGeneralPath = false;
}
function commitClip(state) {
  if (state.pendingClipRule && state.path.length > 0) {
    state.clips.push({
      d: state.path.join(""),
      ...state.pendingClipRule === "evenodd" ? { fillRule: "evenodd" } : {}
    });
  }
  state.pendingClipRule = void 0;
}
async function interpretXObject(reader, args, state, resources, fills, paths, images, depth, activeForms) {
  if (depth >= reader.limits.maxFormDepth) return;
  const name = args.at(-1);
  if (!isName(name)) return;
  const xObjects = await reader.resolveDict(resources?.get("XObject"));
  const value = xObjects?.get(name.value);
  if (!value) return;
  const objectNumber = isRef(value) ? value.object : void 0;
  if (objectNumber !== void 0 && activeForms.has(objectNumber)) return;
  const form = await reader.resolve(value);
  if (!isStream(form)) return;
  if (isName(form.dict.get("Subtype"), "Image")) {
    const image = await rasterImage(reader, form, state);
    if (image) images.push(image);
    return;
  }
  if (!isName(form.dict.get("Subtype"), "Form")) return;
  const resourceValue = form.dict.get("Resources");
  const resolvedResources = resourceValue === void 0 ? void 0 : await reader.resolve(resourceValue);
  const formResources = isDict(resolvedResources) ? resolvedResources : resources;
  const nestedForms = new Set(activeForms);
  if (objectNumber !== void 0) nestedForms.add(objectNumber);
  const nested = createState();
  nested.ctm = multiply(state.ctm, pdfMatrix(form.dict.get("Matrix")) ?? identity);
  nested.fillColor = state.fillColor;
  nested.strokeColor = state.strokeColor;
  nested.lineWidth = state.lineWidth;
  nested.fillColorSpace = state.fillColorSpace;
  nested.strokeColorSpace = state.strokeColorSpace;
  nested.fillOpacity = state.fillOpacity;
  nested.strokeOpacity = state.strokeOpacity;
  nested.clips = state.clips.map((clip) => ({ ...clip }));
  await interpret(
    reader,
    await reader.decodeStream(form),
    nested,
    formResources,
    fills,
    paths,
    images,
    depth + 1,
    nestedForms
  );
}
async function rasterImage(reader, stream, state) {
  const width = stream.dict.get("Width");
  const height = stream.dict.get("Height");
  const bits = stream.dict.get("BitsPerComponent");
  const filter = stream.dict.get("Filter");
  if (typeof width !== "number" || typeof height !== "number" || !Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0 || bits !== 8) {
    return void 0;
  }
  const jpeg = await jpegBytes(reader, stream, filter);
  if (jpeg) {
    return {
      width,
      height,
      format: "jpeg",
      data: jpeg,
      transform: [...state.ctm],
      ...state.fillOpacity !== 1 ? { opacity: state.fillOpacity } : {},
      ...state.clips.length > 0 ? { clips: state.clips.map((clip) => ({ ...clip })) } : {}
    };
  }
  if (!isName(stream.dict.get("ColorSpace"), "DeviceRGB") || !supportedRasterFilters(filter)) {
    return void 0;
  }
  const data = await reader.decodeStream(stream);
  if (data.length !== width * height * 3) return void 0;
  return {
    width,
    height,
    format: "rgb",
    data,
    transform: [...state.ctm],
    ...state.fillOpacity !== 1 ? { opacity: state.fillOpacity } : {},
    ...state.clips.length > 0 ? { clips: state.clips.map((clip) => ({ ...clip })) } : {}
  };
}
async function jpegBytes(reader, stream, filter) {
  const filters = Array.isArray(filter) ? filter : filter === void 0 ? [] : [filter];
  const terminal = filters.at(-1);
  if (!isName(terminal) || !["DCTDecode", "DCT"].includes(terminal.value)) return void 0;
  const prefix = filters.slice(0, -1);
  if (!supportedRasterFilters(prefix)) return void 0;
  if (prefix.length === 0) return stream.bytes;
  const dict = new Map(stream.dict);
  dict.set("Filter", prefix);
  const parameters = stream.dict.get("DecodeParms") ?? stream.dict.get("DP");
  if (Array.isArray(parameters)) dict.set("DecodeParms", parameters.slice(0, -1));
  return reader.decodeStream({ ...stream, dict });
}
function supportedRasterFilters(value) {
  if (value === void 0) return true;
  const filters = Array.isArray(value) ? value : [value];
  return filters.every(
    (filter) => isName(filter) && ["FlateDecode", "Fl", "LZWDecode", "LZW", "ASCIIHexDecode", "AHx"].includes(filter.value)
  );
}
function reorderBidiLines(spans) {
  const output = [];
  for (let start = 0; start < spans.length; ) {
    let end = start + 1;
    const y = spans[start].bounds.y;
    while (end < spans.length && Math.abs(spans[end].bounds.y - y) <= 0.25) end += 1;
    const line = spans.slice(start, end);
    const text = line.map((span) => span.text).join("");
    const rtlCount = [...text].filter(isRtlCharacter).length;
    const strongCount = [...text].filter(
      (character) => isRtlCharacter(character) || /[A-Za-z]/.test(character)
    ).length;
    if (rtlCount > 0 && rtlCount * 2 >= strongCount) {
      const left = Math.min(...line.map((span) => span.bounds.x));
      const preserveChunkOrder = /[\u0600-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(text) && !/[\u0590-\u05FF]/u.test(text);
      const chunks = preserveChunkOrder ? line : line.reverse();
      const reordered = chunks.map((span) => ({
        ...span,
        text: [...span.text].some(isRtlCharacter) ? [...span.text].reverse().join("") : span.text,
        bounds: { ...span.bounds },
        direction: "rtl"
      }));
      const mixedText = reorderMixedRtlCitation(reordered.map((span) => span.text).join(""));
      if (mixedText !== void 0) {
        const first2 = reordered[0];
        output.push({ ...first2, text: mixedText, bounds: { ...first2.bounds, x: left } });
        start = end;
        continue;
      }
      const first = reordered[0];
      const wordInset = /\s/u.test(text) && /[\u0590-\u05FF]/u.test(text) ? first.fontSize * 0.035 : 0;
      first.bounds.x = left + wordInset;
      output.push(...reordered);
    } else {
      output.push(...line);
    }
    start = end;
  }
  return output;
}
function reorderMixedRtlCitation(text) {
  const match = /^\)\s*([\u0590-\u05FF][\u0590-\u05FF\s]*?)(\d+)\(([\u0590-\u05FF]+)\(\)(\d+)([\u0590-\u05FF][\u0590-\u05FF\s]*)$/u.exec(
    text
  );
  if (!match) return void 0;
  const [, following, visualRight, label, visualLeft, preceding] = match;
  return `${preceding ?? ""}${visualLeft ?? ""}(${label ?? ""})(${visualRight ?? ""}) ${following ?? ""}`;
}
function isRtlCharacter(character) {
  const code = character.codePointAt(0) ?? 0;
  return code >= 1424 && code <= 2303 || code >= 64285 && code <= 65023 || code >= 65136 && code <= 65279;
}
function decodeUtf16Bytes(bytes) {
  let output = "";
  for (let index = 0; index + 1 < bytes.length; index += 2) {
    output += String.fromCharCode((bytes[index] ?? 0) << 8 | (bytes[index + 1] ?? 0));
  }
  return output;
}
function parseToUnicode(bytes) {
  const text = new TextDecoder("latin1").decode(bytes);
  const mapping = /* @__PURE__ */ new Map();
  const sourceWidths = [];
  const codeSpaceRanges = [];
  for (const block of text.matchAll(/begincodespacerange([\s\S]*?)endcodespacerange/g)) {
    for (const match of (block[1] ?? "").matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]+)>/gi)) {
      const startHex = match[1];
      const endHex = match[2];
      if (startHex === void 0 || endHex === void 0 || startHex.length !== endHex.length) {
        continue;
      }
      codeSpaceRanges.push({
        width: Math.ceil(startHex.length / 2),
        start: Number.parseInt(startHex, 16),
        end: Number.parseInt(endHex, 16)
      });
    }
  }
  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const match of (block[1] ?? "").matchAll(/<([0-9a-f]+)>\s*<([0-9a-f]+)>/gi)) {
      const source = match[1];
      const destination = match[2];
      if (source !== void 0 && destination !== void 0) {
        sourceWidths.push(Math.ceil(source.length / 2));
        mapping.set(Number.parseInt(source, 16), decodeUtf16Hex(destination));
      }
    }
  }
  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const match of (block[1] ?? "").matchAll(
      /<([0-9a-f]+)>\s*<([0-9a-f]+)>\s*<([0-9a-f]+)>/gi
    )) {
      const startHex = match[1];
      const endHex = match[2];
      const destinationHex = match[3];
      if (startHex === void 0 || endHex === void 0 || destinationHex === void 0) continue;
      const start = Number.parseInt(startHex, 16);
      const end = Number.parseInt(endHex, 16);
      sourceWidths.push(Math.ceil(startHex.length / 2));
      for (let code = start; code <= end; code += 1) {
        mapping.set(code, decodeUtf16Hex(incrementHex(destinationHex, code - start)));
      }
    }
    for (const match of (block[1] ?? "").matchAll(
      /<([0-9a-f]+)>\s*<([0-9a-f]+)>\s*\[((?:\s*<[0-9a-f]+>\s*)+)\]/gi
    )) {
      const startHex = match[1];
      const endHex = match[2];
      const destinations = [...(match[3] ?? "").matchAll(/<([0-9a-f]+)>/gi)];
      if (startHex === void 0 || endHex === void 0) continue;
      const start = Number.parseInt(startHex, 16);
      const end = Number.parseInt(endHex, 16);
      sourceWidths.push(Math.ceil(startHex.length / 2));
      for (let code = start; code <= end; code += 1) {
        const destination = destinations[code - start]?.[1];
        if (destination !== void 0) mapping.set(code, decodeUtf16Hex(destination));
      }
    }
  }
  const widths = new Set(sourceWidths);
  return {
    mapping,
    codeBytes: widths.size === 1 ? sourceWidths[0] : void 0,
    codeSpaceRanges
  };
}
function decodeWithMap(bytes, unicodeMap, defaultCodeBytes, fallback) {
  let output = "";
  for (let index = 0; index < bytes.length; ) {
    const codeBytes = unicodeMap.codeBytes ?? codeWidthAt(bytes, index, unicodeMap.codeSpaceRanges) ?? defaultCodeBytes;
    let code = 0;
    for (let byte = 0; byte < codeBytes; byte += 1) code = code * 256 + (bytes[index + byte] ?? 0);
    output += unicodeMap.mapping.get(code) ?? (codeBytes === 1 ? fallback.decode(bytes.subarray(index, index + 1)) : String.fromCodePoint(code));
    index += codeBytes;
  }
  return output;
}
function codeWidthAt(bytes, index, ranges) {
  for (const range of ranges) {
    if (index + range.width > bytes.length) continue;
    let code = 0;
    for (let offset = 0; offset < range.width; offset += 1) {
      code = code * 256 + (bytes[index + offset] ?? 0);
    }
    if (code >= range.start && code <= range.end) return range.width;
  }
  return void 0;
}
function incrementHex(hex, amount) {
  return (BigInt(`0x${hex}`) + BigInt(amount)).toString(16).padStart(hex.length, "0");
}
function decodeUtf16Hex(hex) {
  const units = hex.match(/.{4}/g)?.map((unit) => Number.parseInt(unit, 16)) ?? [];
  return normalizeTextCompatibility(String.fromCharCode(...units));
}
function normalizeTextCompatibility(text) {
  return text.replaceAll("\uFB00", "ff").replaceAll("\uFB01", "fi").replaceAll("\uFB02", "fl").replaceAll("\uFB03", "ffi").replaceAll("\uFB04", "ffl").replaceAll("\uFCCB", "\u0644\u062E");
}
async function loadCidUnicodeGlyphMap(reader, font, toUnicodeValue) {
  if (!isName(font.get("Subtype"), "Type0") || toUnicodeValue === void 0) return /* @__PURE__ */ new Map();
  const encodingValue = font.get("Encoding");
  if (encodingValue === void 0) return /* @__PURE__ */ new Map();
  const toUnicode = await reader.resolve(toUnicodeValue);
  if (!isStream(toUnicode)) return /* @__PURE__ */ new Map();
  const unicodeBytes = await reader.decodeStream(toUnicode);
  const unicode = parseToUnicode(unicodeBytes).mapping;
  if (isName(encodingValue) && /^Identity-[HV]$/.test(encodingValue.value)) {
    return unicodeGlyphMap(unicode, (source) => source);
  }
  const encoding = await reader.resolve(encodingValue);
  if (!isStream(encoding)) return /* @__PURE__ */ new Map();
  const cids = parseCidCharacters(await reader.decodeStream(encoding));
  return unicodeGlyphMap(unicode, (source) => cids.get(source));
}
function unicodeGlyphMap(unicode, glyphForSource) {
  const output = /* @__PURE__ */ new Map();
  for (const [source, text] of unicode) {
    const codePoint = text?.codePointAt(0);
    const glyph = glyphForSource(source);
    if (codePoint !== void 0 && glyph !== void 0) output.set(codePoint, glyph);
  }
  return output;
}
function parseCidCharacters(bytes) {
  const text = new TextDecoder("latin1").decode(bytes);
  const output = /* @__PURE__ */ new Map();
  for (const match of text.matchAll(/<([\da-f]+)>\s+(\d+)/gi)) {
    const source = Number.parseInt(match[1] ?? "", 16);
    const cid = Number(match[2]);
    if (Number.isSafeInteger(source) && Number.isSafeInteger(cid)) output.set(source, cid);
  }
  return output;
}
async function extractTrueTypeFont(reader, font, id, family) {
  const programFont = await descendantFont(reader, font);
  if (!programFont) return void 0;
  const descriptor = await reader.resolveDict(programFont.get("FontDescriptor"));
  const fontFileValue = descriptor?.get("FontFile2");
  if (fontFileValue === void 0) return void 0;
  const fontFile = await reader.resolve(fontFileValue);
  if (!isStream(fontFile)) return void 0;
  try {
    return {
      id,
      ...family ? { family } : {},
      format: "truetype",
      data: await reader.decodeStream(fontFile)
    };
  } catch (error) {
    if (error instanceof Error && /exceeds configured/.test(error.message)) throw error;
    return void 0;
  }
}
async function descendantFont(reader, font) {
  if (!isName(font.get("Subtype"), "Type0")) return font;
  const descendants = await reader.resolve(font.get("DescendantFonts") ?? null);
  return Array.isArray(descendants) && descendants.length > 0 ? await reader.resolveDict(descendants[0]) : void 0;
}
function parseTrueTypeMetrics(bytes) {
  if (bytes.length < 12) return void 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tables = readTableDirectory(bytes, view);
  const head = tables.get("head");
  const hhea = tables.get("hhea");
  const maxp = tables.get("maxp");
  const hmtx = tables.get("hmtx");
  const cmap = tables.get("cmap");
  if (!head || !hhea || !maxp || !hmtx || !cmap) return void 0;
  if (!contains(head, 20) || !contains(hhea, 36) || !contains(maxp, 6)) return void 0;
  const unitsPerEm = view.getUint16(head.offset + 18);
  const numberOfHMetrics = view.getUint16(hhea.offset + 34);
  const numberOfGlyphs = view.getUint16(maxp.offset + 4);
  if (unitsPerEm === 0 || numberOfHMetrics === 0 || numberOfGlyphs === 0) return void 0;
  if (numberOfHMetrics > numberOfGlyphs || !contains(hmtx, numberOfHMetrics * 4)) return void 0;
  const mapping = readCmap(view, cmap, numberOfGlyphs);
  if (!mapping) return void 0;
  return {
    widthOfCodePoint(codePoint) {
      const glyph = mapping.glyphOfCodePoint(codePoint);
      if (glyph === void 0 || glyph >= numberOfGlyphs) return void 0;
      const metric = Math.min(glyph, numberOfHMetrics - 1);
      return view.getUint16(hmtx.offset + metric * 4) / unitsPerEm;
    },
    glyphOfCodePoint: mapping.glyphOfCodePoint,
    codePointOfGlyph: mapping.codePointOfGlyph
  };
}
function parseTrueTypeCmap(bytes) {
  if (bytes.length < 12) return void 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tables = readTableDirectory(bytes, view);
  const cmap = tables.get("cmap");
  const maxp = tables.get("maxp");
  if (!cmap || !maxp || !contains(maxp, 6)) return void 0;
  return readCmap(view, cmap, view.getUint16(maxp.offset + 4));
}
function readTableDirectory(bytes, view) {
  const output = /* @__PURE__ */ new Map();
  const count = view.getUint16(4);
  for (let index = 0; index < count; index += 1) {
    const record = 12 + index * 16;
    if (record + 16 > bytes.length) break;
    const tag = new TextDecoder("latin1").decode(bytes.subarray(record, record + 4));
    const offset = view.getUint32(record + 8);
    const length = view.getUint32(record + 12);
    if (offset <= bytes.length && length <= bytes.length - offset)
      output.set(tag, { offset, length });
  }
  return output;
}
function readCmap(view, table, numberOfGlyphs) {
  if (!contains(table, 4)) return void 0;
  const count = view.getUint16(table.offset + 2);
  const candidates = [];
  for (let index = 0; index < count; index += 1) {
    const record = table.offset + 4 + index * 8;
    if (record + 8 > table.offset + table.length) break;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const offset = table.offset + view.getUint32(record + 4);
    if (offset + 2 > table.offset + table.length) continue;
    const format = view.getUint16(offset);
    const score = platform === 3 && encoding === 10 ? 4 : platform === 3 ? 3 : platform === 0 ? 2 : platform === 1 ? 1 : 0;
    if ((format === 4 || format === 6 || format === 12) && score > 0)
      candidates.push({ format, offset, score });
  }
  candidates.sort((left, right) => right.score - left.score || right.format - left.format);
  const selected = candidates[0];
  if (!selected) return void 0;
  return selected.format === 12 ? readFormat12(view, table, selected.offset) : selected.format === 6 ? readFormat6(view, table, selected.offset, numberOfGlyphs) : readFormat4(view, table, selected.offset, numberOfGlyphs);
}
function readFormat6(view, table, offset, numberOfGlyphs) {
  if (offset + 10 > table.offset + table.length) return void 0;
  const length = view.getUint16(offset + 2);
  const firstCode = view.getUint16(offset + 6);
  const entryCount = view.getUint16(offset + 8);
  if (length < 10 || offset + length > table.offset + table.length || 10 + entryCount * 2 > length)
    return void 0;
  return {
    glyphOfCodePoint(codePoint) {
      const index = codePoint - firstCode;
      if (index < 0 || index >= entryCount) return void 0;
      const glyph = view.getUint16(offset + 10 + index * 2);
      return glyph < numberOfGlyphs ? glyph : void 0;
    },
    codePointOfGlyph(glyph) {
      for (let index = 0; index < entryCount; index += 1) {
        if (view.getUint16(offset + 10 + index * 2) === glyph) return firstCode + index;
      }
      return void 0;
    }
  };
}
function readFormat12(view, table, offset) {
  if (offset + 16 > table.offset + table.length) return void 0;
  const length = view.getUint32(offset + 4);
  const groups = view.getUint32(offset + 12);
  if (length < 16 || offset + length > table.offset + table.length || groups > 1e6)
    return void 0;
  if (16 + groups * 12 > length) return void 0;
  return {
    glyphOfCodePoint(codePoint) {
      let low = 0;
      let high = groups - 1;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const record = offset + 16 + middle * 12;
        const start = view.getUint32(record);
        const end = view.getUint32(record + 4);
        if (codePoint < start) high = middle - 1;
        else if (codePoint > end) low = middle + 1;
        else return view.getUint32(record + 8) + codePoint - start;
      }
      return void 0;
    },
    codePointOfGlyph(glyph) {
      for (let index = 0; index < groups; index += 1) {
        const record = offset + 16 + index * 12;
        const start = view.getUint32(record);
        const end = view.getUint32(record + 4);
        const firstGlyph = view.getUint32(record + 8);
        if (glyph >= firstGlyph && glyph <= firstGlyph + end - start)
          return start + glyph - firstGlyph;
      }
      return void 0;
    }
  };
}
function readFormat4(view, table, offset, numberOfGlyphs) {
  if (offset + 14 > table.offset + table.length) return void 0;
  const length = view.getUint16(offset + 2);
  const segmentCount = view.getUint16(offset + 6) / 2;
  if (length < 16 || offset + length > table.offset + table.length || segmentCount > 8192)
    return void 0;
  const endCodes = offset + 14;
  const startCodes = endCodes + segmentCount * 2 + 2;
  const deltas = startCodes + segmentCount * 2;
  const rangeOffsets = deltas + segmentCount * 2;
  if (rangeOffsets + segmentCount * 2 > offset + length) return void 0;
  const glyphOfCodePoint = (codePoint) => {
    if (codePoint > 65535) return void 0;
    for (let index = 0; index < segmentCount; index += 1) {
      const end = view.getUint16(endCodes + index * 2);
      if (codePoint > end) continue;
      const start = view.getUint16(startCodes + index * 2);
      if (codePoint < start) return void 0;
      const delta = view.getInt16(deltas + index * 2);
      const rangeOffsetPosition = rangeOffsets + index * 2;
      const rangeOffset = view.getUint16(rangeOffsetPosition);
      if (rangeOffset === 0) return codePoint + delta & 65535;
      const glyphPosition = rangeOffsetPosition + rangeOffset + (codePoint - start) * 2;
      if (glyphPosition + 2 > offset + length) return void 0;
      const glyph = view.getUint16(glyphPosition);
      return glyph === 0 ? 0 : glyph + delta & 65535;
    }
    return void 0;
  };
  let reverse;
  return {
    glyphOfCodePoint,
    codePointOfGlyph(glyph) {
      if (!reverse) {
        reverse = new Uint32Array(numberOfGlyphs);
        let work = 0;
        for (let index = 0; index < segmentCount && work <= 65536; index += 1) {
          const start = view.getUint16(startCodes + index * 2);
          const end = view.getUint16(endCodes + index * 2);
          const delta = view.getInt16(deltas + index * 2);
          const rangeOffsetPosition = rangeOffsets + index * 2;
          const rangeOffset = view.getUint16(rangeOffsetPosition);
          for (let codePoint = start; codePoint <= end && work <= 65536; codePoint += 1) {
            work += 1;
            let mapped;
            if (rangeOffset === 0) mapped = codePoint + delta & 65535;
            else {
              const position = rangeOffsetPosition + rangeOffset + (codePoint - start) * 2;
              if (position + 2 > offset + length) break;
              const raw = view.getUint16(position);
              mapped = raw === 0 ? 0 : raw + delta & 65535;
            }
            if (mapped < reverse.length && reverse[mapped] === 0) reverse[mapped] = codePoint + 1;
          }
        }
      }
      const stored = reverse[glyph];
      return stored ? stored - 1 : void 0;
    }
  };
}
function contains(table, requiredLength) {
  return table.length >= requiredLength;
}
var checksumMagic = 2981146554;
function remapTrueTypeCmap(font, mappings) {
  const tables = readTables(font);
  if (!tables?.some((table) => table.tag === "head")) {
    return void 0;
  }
  const glyphCount = maxGlyphCount(tables);
  const validMappings = new Map(
    [...mappings].filter(([, glyph]) => glyph >= 0 && glyph < glyphCount)
  );
  const cmap = validMappings.size > 0 ? format12Cmap(validMappings) : void 0;
  const records = tables.map(
    (table) => table.tag === "cmap" && cmap ? { tag: "cmap", data: cmap } : table
  );
  repairHorizontalMetrics(records);
  if (cmap && !records.some((table) => table.tag === "cmap")) {
    records.push({ tag: "cmap", data: cmap });
  }
  if (!records.some((table) => table.tag === "OS/2")) {
    records.push({ tag: "OS/2", data: minimalOs2(records, validMappings) });
  }
  if (!records.some((table) => table.tag === "name")) {
    records.push({ tag: "name", data: minimalName() });
  }
  if (!records.some((table) => table.tag === "post")) {
    records.push({ tag: "post", data: minimalPost() });
  }
  records.sort((left, right) => left.tag < right.tag ? -1 : left.tag > right.tag ? 1 : 0);
  return buildFont(font, records);
}
async function symbolicTrueTypeGlyphMap(reader, font, data, encoding) {
  if (!isName(font.get("Subtype"), "TrueType")) return /* @__PURE__ */ new Map();
  const descriptor = await reader.resolveDict(font.get("FontDescriptor"));
  const flags = descriptor?.get("Flags");
  if (typeof flags !== "number" || (flags & 4) === 0) return /* @__PURE__ */ new Map();
  const cmap = parseTrueTypeCmap(data);
  if (!cmap) return /* @__PURE__ */ new Map();
  const mappings = /* @__PURE__ */ new Map();
  for (let code = 0; code <= 255; code += 1) {
    const decoded = encoding.decode(Uint8Array.of(code));
    const codePoint = decoded.codePointAt(0);
    if (codePoint === void 0 || [...decoded].length !== 1) continue;
    const glyph = cmap.glyphOfCodePoint(61440 + code) ?? cmap.glyphOfCodePoint(code);
    if (glyph !== void 0) mappings.set(codePoint, glyph);
  }
  return mappings;
}
function repairHorizontalMetrics(tables) {
  const hhea = tables.find((table) => table.tag === "hhea")?.data;
  const maxp = tables.find((table) => table.tag === "maxp")?.data;
  const hmtx = tables.find((table) => table.tag === "hmtx");
  if (!hhea || hhea.length < 36 || !maxp || maxp.length < 6 || !hmtx) return;
  const glyphCount = u16(maxp, 4);
  const metricCount = u16(hhea, 34);
  if (metricCount === 0 || metricCount > glyphCount) return;
  const expected = metricCount * 4 + (glyphCount - metricCount) * 2;
  if (hmtx.data.length >= expected || hmtx.data.length < metricCount * 4) return;
  const repaired = new Uint8Array(expected);
  repaired.set(hmtx.data);
  hmtx.data = repaired;
}
function maxGlyphCount(tables) {
  const maxp = tables.find((table) => table.tag === "maxp")?.data;
  return maxp && maxp.length >= 6 ? u16(maxp, 4) : 0;
}
function minimalOs2(tables, mappings) {
  const output = new Uint8Array(96);
  const hhea = tables.find((table) => table.tag === "hhea")?.data;
  const ascender = hhea && hhea.length >= 8 ? i16(hhea, 4) : 800;
  const descender = hhea && hhea.length >= 8 ? i16(hhea, 6) : -200;
  const bmp = [...mappings.keys()].filter((codePoint) => codePoint <= 65535);
  setU16(output, 0, 3);
  setI16(output, 2, 500);
  setU16(output, 4, 400);
  setU16(output, 6, 5);
  output.set(new TextEncoder().encode("BOXP"), 58);
  setU16(output, 62, 64);
  setU16(output, 64, bmp.length > 0 ? Math.min(...bmp) : 0);
  setU16(output, 66, bmp.length > 0 ? Math.max(...bmp) : 65535);
  setI16(output, 68, ascender);
  setI16(output, 70, descender);
  setU16(output, 74, Math.max(0, ascender));
  setU16(output, 76, Math.max(0, -descender));
  setU32(output, 78, 1);
  setI16(output, 86, Math.round(ascender / 2));
  setI16(output, 88, ascender);
  setU16(output, 92, 32);
  setU16(output, 94, 2);
  return output;
}
function minimalName() {
  const family = utf16be("BoxPDF Subset");
  const postscript = utf16be("BoxPDFSubset");
  const output = new Uint8Array(30 + family.length + postscript.length);
  setU16(output, 2, 2);
  setU16(output, 4, 30);
  nameRecord(output, 6, 1, family.length, 0);
  nameRecord(output, 18, 6, postscript.length, family.length);
  output.set(family, 30);
  output.set(postscript, 30 + family.length);
  return output;
}
function nameRecord(output, offset, nameId, length, stringOffset) {
  setU16(output, offset, 3);
  setU16(output, offset + 2, 1);
  setU16(output, offset + 4, 1033);
  setU16(output, offset + 6, nameId);
  setU16(output, offset + 8, length);
  setU16(output, offset + 10, stringOffset);
}
function minimalPost() {
  const output = new Uint8Array(32);
  setU32(output, 0, 196608);
  return output;
}
function utf16be(value) {
  const output = new Uint8Array(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    setU16(output, index * 2, value.charCodeAt(index));
  }
  return output;
}
function readTables(font) {
  if (font.length < 12) return void 0;
  const count = u16(font, 4);
  if (count <= 0 || 12 + count * 16 > font.length) return void 0;
  const output = [];
  for (let index = 0; index < count; index += 1) {
    const record = 12 + index * 16;
    const offset = u32(font, record + 8);
    const length = u32(font, record + 12);
    if (offset + length > font.length) return void 0;
    output.push({
      tag: String.fromCharCode(...font.subarray(record, record + 4)),
      data: font.slice(offset, offset + length)
    });
  }
  return output;
}
function format12Cmap(mappings) {
  const entries = [...mappings].filter(
    ([codePoint, glyph]) => Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 1114111 && Number.isInteger(glyph) && glyph >= 0 && glyph <= 65535
  ).sort((left, right) => left[0] - right[0]);
  const groups = [];
  for (const [codePoint, glyph] of entries) {
    const previous = groups.at(-1);
    if (previous && codePoint === previous[1] + 1 && glyph === previous[2] + codePoint - previous[0]) {
      previous[1] = codePoint;
    } else {
      groups.push([codePoint, codePoint, glyph]);
    }
  }
  const output = new Uint8Array(12 + 16 + groups.length * 12);
  setU16(output, 2, 1);
  setU16(output, 4, 3);
  setU16(output, 6, 10);
  setU32(output, 8, 12);
  setU16(output, 12, 12);
  setU32(output, 16, 16 + groups.length * 12);
  setU32(output, 24, groups.length);
  groups.forEach(([start, end, glyph], index) => {
    const offset = 28 + index * 12;
    setU32(output, offset, start);
    setU32(output, offset + 4, end);
    setU32(output, offset + 8, glyph);
  });
  return output;
}
function buildFont(original, tables) {
  const count = tables.length;
  const directoryLength = 12 + count * 16;
  const totalLength = tables.reduce(
    (length, table) => align4(length + table.data.length),
    directoryLength
  );
  const output = new Uint8Array(totalLength);
  output.set(original.subarray(0, 4));
  setU16(output, 4, count);
  const maximumPower = 2 ** Math.floor(Math.log2(count));
  setU16(output, 6, maximumPower * 16);
  setU16(output, 8, Math.log2(maximumPower));
  setU16(output, 10, count * 16 - maximumPower * 16);
  let dataOffset = directoryLength;
  let headOffset = -1;
  tables.forEach((table, index) => {
    const record = 12 + index * 16;
    for (let tagIndex = 0; tagIndex < 4; tagIndex += 1) {
      output[record + tagIndex] = table.tag.charCodeAt(tagIndex) || 32;
    }
    output.set(table.data, dataOffset);
    if (table.tag === "head") {
      headOffset = dataOffset;
      if (table.data.length >= 12) setU32(output, dataOffset + 8, 0);
    }
    setU32(
      output,
      record + 4,
      checksum(output.subarray(dataOffset, dataOffset + table.data.length))
    );
    setU32(output, record + 8, dataOffset);
    setU32(output, record + 12, table.data.length);
    dataOffset = align4(dataOffset + table.data.length);
  });
  if (headOffset >= 0) setU32(output, headOffset + 8, checksumMagic - checksum(output) >>> 0);
  return output;
}
function checksum(bytes) {
  let total = 0;
  for (let offset = 0; offset < bytes.length; offset += 4)
    total = total + u32(bytes, offset) >>> 0;
  return total;
}
function align4(value) {
  return value + 3 & ~3;
}
function u16(bytes, offset) {
  return (bytes[offset] ?? 0) << 8 | (bytes[offset + 1] ?? 0);
}
function i16(bytes, offset) {
  const value = u16(bytes, offset);
  return value > 32767 ? value - 65536 : value;
}
function u32(bytes, offset) {
  return ((bytes[offset] ?? 0) << 24 | (bytes[offset + 1] ?? 0) << 16 | (bytes[offset + 2] ?? 0) << 8 | (bytes[offset + 3] ?? 0)) >>> 0;
}
function setU16(bytes, offset, value) {
  bytes[offset] = value >>> 8 & 255;
  bytes[offset + 1] = value & 255;
}
function setI16(bytes, offset, value) {
  setU16(bytes, offset, value & 65535);
}
function setU32(bytes, offset, value) {
  bytes[offset] = value >>> 24 & 255;
  bytes[offset + 1] = value >>> 16 & 255;
  bytes[offset + 2] = value >>> 8 & 255;
  bytes[offset + 3] = value & 255;
}
function isPdfString(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "type" in value && value.type === "string";
}
function decodePdfString(bytes) {
  if (bytes[0] === 254 && bytes[1] === 255) {
    let output = "";
    for (let index = 2; index + 1 < bytes.length; index += 2) {
      output += String.fromCharCode((bytes[index] ?? 0) << 8 | (bytes[index + 1] ?? 0));
    }
    return output;
  }
  return new TextDecoder("windows-1252").decode(bytes);
}
function collapseZeroPaddedSingleByteCodes(bytes) {
  if (bytes.length < 4 || bytes.length % 2 !== 0) return bytes;
  for (let index = 0; index < bytes.length; index += 2) {
    if (bytes[index] !== 0) return bytes;
  }
  const collapsed = new Uint8Array(bytes.length / 2);
  for (let index = 0; index < collapsed.length; index += 1) {
    collapsed[index] = bytes[index * 2 + 1] ?? 0;
  }
  return collapsed;
}
function containsTextShowingOperator(bytes) {
  return /(?:^|\s)(?:Tj|TJ|'|")(?:\s|$)/.test(new TextDecoder("latin1").decode(bytes));
}
function textAdvance(bytes, text, state, font) {
  const vertical = font?.writingMode === "vertical";
  const metric = vertical ? font.verticalAdvance : font?.advance;
  if (!metric) return approximateAdvance(text, state, vertical);
  const spacing = text.length * state.charSpacing + [...text].filter((character) => character === " ").length * state.wordSpacing;
  const advance = metric(bytes) * state.fontSize + spacing;
  return vertical ? advance : advance * state.horizontalScale;
}
function approximateAdvance(text, state, vertical = false) {
  let units = 0;
  for (const character of text) {
    units += character === " " ? 0.278 : 0.5;
    units += state.charSpacing / Math.max(1, state.fontSize);
    if (character === " ") units += state.wordSpacing / Math.max(1, state.fontSize);
  }
  return units * state.fontSize * (vertical ? 1 : state.horizontalScale);
}
function createTextState() {
  return {
    fontSize: 0,
    charSpacing: 0,
    wordSpacing: 0,
    horizontalScale: 1,
    leading: 0,
    rise: 0,
    textMatrix: [...identityMatrix],
    lineMatrix: [...identityMatrix],
    ctm: [...identityMatrix],
    fillColor: "#000000",
    strokeColor: "#000000",
    lineWidth: 1,
    renderingMode: 0,
    fillColorSpace: void 0,
    strokeColorSpace: void 0,
    fillOpacity: 1,
    strokeOpacity: 1,
    graphicsStack: []
  };
}
function cloneTextState(state) {
  return {
    ...state,
    textMatrix: [...state.textMatrix],
    lineMatrix: [...state.lineMatrix],
    ctm: [...state.ctm],
    graphicsStack: state.graphicsStack.map((entry) => ({
      ctm: [...entry.ctm],
      fillColor: entry.fillColor,
      strokeColor: entry.strokeColor,
      lineWidth: entry.lineWidth,
      fillColorSpace: entry.fillColorSpace,
      strokeColorSpace: entry.strokeColorSpace,
      fillOpacity: entry.fillOpacity,
      strokeOpacity: entry.strokeOpacity
    }))
  };
}
function restoreTextState(state, saved) {
  Object.assign(state, saved);
}
function decodeGroup4Mask(data, width, height) {
  const tiff = group4Tiff(data, width, height);
  const buffer = tiff.slice().buffer;
  const ifd = import_utif2.default.decode(buffer)[0];
  if (!ifd) return new Uint8Array();
  import_utif2.default.decodeImage(buffer, ifd);
  const rgba = import_utif2.default.toRGBA8(ifd);
  if (rgba.length !== width * height * 4) return new Uint8Array();
  const stride = Math.ceil(width / 8);
  const output = new Uint8Array(stride * height);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    if ((rgba[offset] ?? 0) >= 128 && (rgba[offset + 1] ?? 0) >= 128 && (rgba[offset + 2] ?? 0) >= 128) {
      const row = Math.floor(pixel / width);
      const column = pixel % width;
      const byte = row * stride + Math.floor(column / 8);
      output[byte] = (output[byte] ?? 0) | 1 << 7 - column % 8;
    }
  }
  return output;
}
function group4Tiff(data, width, height) {
  const entryCount = 11;
  const dataOffset = 8 + 2 + entryCount * 12 + 4;
  const output = new Uint8Array(dataOffset + data.length);
  const view = new DataView(output.buffer);
  output.set([73, 73], 0);
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, entryCount, true);
  let offset = 10;
  const entry = (tag, type, value) => {
    view.setUint16(offset, tag, true);
    view.setUint16(offset + 2, type, true);
    view.setUint32(offset + 4, 1, true);
    if (type === 3) view.setUint16(offset + 8, value, true);
    else view.setUint32(offset + 8, value, true);
    offset += 12;
  };
  entry(256, 4, width);
  entry(257, 4, height);
  entry(258, 3, 1);
  entry(259, 3, 4);
  entry(262, 3, 0);
  entry(266, 3, 1);
  entry(273, 4, dataOffset);
  entry(277, 3, 1);
  entry(278, 4, height);
  entry(279, 4, data.length);
  entry(293, 4, 0);
  output.set(data, dataOffset);
  return output;
}
var latin1 = new TextDecoder("latin1");
function extractInlineImageMaskFills(bytes, initialCtm) {
  const parser = new ValueParser(bytes);
  const operands = [];
  const stack = [];
  let ctm = [...initialCtm];
  const fills = [];
  const decodeCcitt = Math.max(...initialCtm.slice(0, 4).map(Math.abs)) >= 5e-3;
  while (parser.offset < bytes.length) {
    parser.skipSpace();
    if (parser.offset >= bytes.length) break;
    let value;
    try {
      value = parser.parseValue();
    } catch {
      break;
    }
    if (typeof value !== "string") {
      operands.push(value);
      continue;
    }
    if (value === "q") stack.push([...ctm]);
    else if (value === "Q") ctm = stack.pop() ?? [...initialCtm];
    else if (value === "cm") {
      const tail = operands.slice(-6);
      if (tail.length === 6 && tail.every((item) => typeof item === "number")) {
        ctm = multiply2(ctm, tail);
      }
    } else if (value === "BI") {
      const image = readInlineMask(bytes, parser.offset, decodeCcitt);
      if (!image) break;
      fills.push(...maskFills(image.data, image.width, image.height, image.paintZero, ctm));
      parser.offset = image.end;
    }
    operands.length = 0;
  }
  return fills;
}
function readInlineMask(bytes, offset, decodeCcitt) {
  const id = findOperator(bytes, offset, "ID");
  if (id < 0) return void 0;
  const header = latin1.decode(bytes.subarray(offset, id));
  const width = integerEntry(header, "W", "Width");
  const height = integerEntry(header, "H", "Height");
  const bits = integerEntry(header, "BPC", "BitsPerComponent") ?? 1;
  if (!width || !height || bits !== 1 || !/(?:\/IM|\/ImageMask)\s+true\b/.test(header)) {
    return void 0;
  }
  let dataStart = id + 2;
  if (bytes[dataStart] === 13 && bytes[dataStart + 1] === 10) dataStart += 2;
  else if (isWhitespace2(bytes[dataStart])) dataStart += 1;
  const length = Math.ceil(width / 8) * height;
  const group4 = decodeCcitt && /(?:\/F|\/Filter)\s*\/?(?:CCF|CCITTFaxDecode)\b/.test(header);
  if (!group4 && dataStart + length > bytes.length) return void 0;
  const endImage = findOperator(bytes, dataStart + (group4 ? 0 : length), "EI");
  if (group4 && endImage < 0) return void 0;
  const encoded = bytes.subarray(dataStart, group4 ? endImage : dataStart + length);
  const data = group4 ? decodeGroup4Mask(encoded, width, height) : encoded;
  if (data.length !== length) return void 0;
  return {
    width,
    height,
    paintZero: group4 ? !/(?:\/D|\/Decode)\s*\[\s*1(?:\.0*)?\s+0(?:\.0*)?\s*\]/.test(header) : !/(?:\/D|\/Decode)\s+\[\s*1(?:\.0*)?\s+0(?:\.0*)?\s*\]/.test(header),
    data,
    end: endImage < 0 ? dataStart + length : endImage + 2
  };
}
function maskFills(data, width, height, paintZero, ctm) {
  const stride = Math.ceil(width / 8);
  const fills = [];
  for (let row = 0; row < height; row += 1) {
    let start = -1;
    for (let column = 0; column <= width; column += 1) {
      const byte = data[row * stride + Math.floor(column / 8)] ?? 0;
      const bit = column < width ? byte >> 7 - column % 8 & 1 : paintZero ? 1 : 0;
      const painted = paintZero ? bit === 0 : bit === 1;
      if (painted && start < 0) start = column;
      if (!painted && start >= 0) {
        const top = 1 - row / height;
        const bottom = 1 - (row + 1) / height;
        fills.push({
          points: [
            transformPoint2(ctm, start / width, bottom),
            transformPoint2(ctm, column / width, bottom),
            transformPoint2(ctm, column / width, top),
            transformPoint2(ctm, start / width, top)
          ],
          color: "#000000"
        });
        start = -1;
      }
    }
  }
  return fills;
}
function integerEntry(header, short, long) {
  const match = new RegExp(`(?:/${short}|/${long})\\s+(\\d+)\\b`).exec(header);
  const value = Number(match?.[1]);
  return Number.isSafeInteger(value) && value > 0 ? value : void 0;
}
function findOperator(bytes, offset, operator) {
  const first = operator.charCodeAt(0);
  const second = operator.charCodeAt(1);
  for (let index = offset; index + 1 < bytes.length; index += 1) {
    if (bytes[index] === first && bytes[index + 1] === second && (index === 0 || isWhitespace2(bytes[index - 1])) && (index + 2 >= bytes.length || isWhitespace2(bytes[index + 2]))) {
      return index;
    }
  }
  return -1;
}
function isWhitespace2(value) {
  return value === 0 || value === 9 || value === 10 || value === 12 || value === 13 || value === 32;
}
async function extractType3Font(reader, font, id, family) {
  if (!isName(font.get("Subtype"), "Type3")) return void 0;
  const matrix = pdfMatrix2(font.get("FontMatrix"));
  const charProcs = await reader.resolveDict(font.get("CharProcs"));
  if (!matrix || !charProcs) return void 0;
  const names = await type3CodeNames(reader, font.get("Encoding"));
  const widthsValue = font.get("Widths");
  const widths = widthsValue === void 0 ? void 0 : await reader.resolve(widthsValue);
  const firstChar = font.get("FirstChar");
  if (!Array.isArray(widths) || typeof firstChar !== "number") return void 0;
  const resourcesValue = font.get("Resources");
  const resolvedResources = resourcesValue === void 0 ? void 0 : await reader.resolve(resourcesValue);
  const resources = isDict(resolvedResources) ? resolvedResources : void 0;
  const glyphs = [];
  for (let index = 0; index < widths.length; index += 1) {
    const width = widths[index];
    const code = firstChar + index;
    const name = names.get(code);
    if (typeof width !== "number" || !name) continue;
    const procedureValue = charProcs.get(name);
    if (procedureValue === void 0) continue;
    const procedure = await reader.resolve(procedureValue);
    if (!isStream(procedure)) continue;
    const bytes = await reader.decodeStream(procedure);
    const graphics = await extractGraphicsStream(reader, bytes, resources, matrix);
    const maskFills2 = extractInlineImageMaskFills(bytes, matrix);
    const fills = [...graphics.fills, ...maskFills2];
    glyphs.push({
      code,
      advance: Math.abs(width * matrix[0]),
      ...!setsPaintColor(bytes) ? { usesTextColor: true } : {},
      ...fills.length > 0 ? { fills } : {},
      ...graphics.paths.length > 0 ? { paths: graphics.paths } : {}
    });
  }
  return glyphs.length > 0 ? { id, ...family ? { family } : {}, format: "type3", glyphs } : void 0;
}
function setsPaintColor(bytes) {
  const source = new TextDecoder("latin1").decode(bytes);
  return /(?:^|\s)(?:g|G|rg|RG|k|K|sc|SC|scn|SCN)(?:\s|$)/.test(source);
}
async function type3CodeNames(reader, value) {
  const resolved = value === void 0 ? void 0 : await reader.resolve(value);
  const differences = isDict(resolved) ? resolved.get("Differences") : void 0;
  const output = /* @__PURE__ */ new Map();
  if (!Array.isArray(differences)) return output;
  let code;
  for (const item of differences) {
    if (typeof item === "number") code = item;
    else if (isName(item) && code !== void 0) {
      output.set(code, item.value);
      code += 1;
    }
  }
  return output;
}
function findBytes(haystack, needle) {
  outer: for (let index = 0; index <= haystack.length - needle.length; index += 1) {
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[index + offset] !== needle[offset]) continue outer;
    }
    return index;
  }
  return -1;
}
async function loadCidMetrics(reader, font, encoding) {
  if (!isName(font.get("Subtype"), "Type0")) return void 0;
  const descendantsValue = font.get("DescendantFonts");
  if (descendantsValue === void 0) return void 0;
  const descendants = await reader.resolve(descendantsValue);
  if (!Array.isArray(descendants) || descendants.length === 0) return void 0;
  const descendant = await reader.resolveDict(descendants[0]);
  if (!descendant) return void 0;
  const defaultWidth = typeof descendant.get("DW") === "number" ? descendant.get("DW") / 1e3 : 1;
  const widths = await readHorizontalWidths(reader, descendant);
  const advance = (bytes) => sumCodes(bytes, (code) => widths.get(code) ?? defaultWidth);
  if (!await isVerticalEncoding(reader, encoding)) return { advance };
  return loadVerticalMetrics(reader, descendant, widths, defaultWidth, advance);
}
async function embeddedCidUnicodeDecoder(reader, font) {
  if (!isName(font.get("Subtype"), "Type0")) return void 0;
  const descendants = await reader.resolve(font.get("DescendantFonts") ?? null);
  if (!Array.isArray(descendants) || descendants.length === 0) return void 0;
  const descendant = await reader.resolveDict(descendants[0]);
  if (!descendant || !isName(descendant.get("Subtype"), "CIDFontType2")) return void 0;
  const descriptor = await reader.resolveDict(descendant.get("FontDescriptor"));
  const fontFileValue = descriptor?.get("FontFile2");
  if (fontFileValue === void 0) return void 0;
  const fontFile = await reader.resolve(fontFileValue);
  if (!isStream(fontFile)) return void 0;
  const metrics2 = parseTrueTypeMetrics(await reader.decodeStream(fontFile));
  if (!metrics2) return void 0;
  const cidToGidValue = descendant.get("CIDToGIDMap");
  const cidToGid = cidToGidValue === void 0 ? void 0 : await reader.resolve(cidToGidValue);
  const mapping = isStream(cidToGid) ? await reader.decodeStream(cidToGid) : void 0;
  return (bytes) => {
    let output = "";
    for (const cid of cidCodes(bytes)) {
      const offset = cid * 2;
      const glyph = mapping && offset + 1 < mapping.length ? (mapping[offset] ?? 0) << 8 | (mapping[offset + 1] ?? 0) : cid;
      const codePoint = metrics2.codePointOfGlyph(glyph);
      output += codePoint === void 0 ? "\uFFFD" : String.fromCodePoint(codePoint);
    }
    return output;
  };
}
async function readHorizontalWidths(reader, descendant) {
  const widths = /* @__PURE__ */ new Map();
  const value = descendant.get("W");
  const entries = value === void 0 ? void 0 : await reader.resolve(value);
  if (!Array.isArray(entries)) return widths;
  for (let index = 0; index < entries.length; ) {
    const first = entries[index];
    const next = entries[index + 1];
    if (typeof first !== "number") break;
    if (Array.isArray(next)) {
      for (const [offset, width2] of next.entries()) {
        if (typeof width2 === "number") widths.set(first + offset, width2 / 1e3);
      }
      index += 2;
      continue;
    }
    const last = next;
    const width = entries[index + 2];
    if (typeof last !== "number" || typeof width !== "number") break;
    for (let code = first; code <= last && code - first <= 65536; code += 1)
      widths.set(code, width / 1e3);
    index += 3;
  }
  return widths;
}
async function isVerticalEncoding(reader, encoding) {
  if (isName(encoding) && encoding.value.endsWith("-V")) return true;
  if (!isStream(encoding)) return false;
  const source = new TextDecoder("latin1").decode(await reader.decodeStream(encoding));
  return /\/WMode\s+1\b/.test(source);
}
async function loadVerticalMetrics(reader, descendant, widths, defaultWidth, advance) {
  const defaults = descendant.get("DW2");
  const defaultOriginY = Array.isArray(defaults) && typeof defaults[0] === "number" ? defaults[0] / 1e3 : 0.88;
  const defaultAdvance = Array.isArray(defaults) && typeof defaults[1] === "number" ? -defaults[1] / 1e3 : 1;
  const advances = /* @__PURE__ */ new Map();
  const origins = /* @__PURE__ */ new Map();
  const value = descendant.get("W2");
  const entries = value === void 0 ? void 0 : await reader.resolve(value);
  if (Array.isArray(entries)) readVerticalWidths(entries, advances, origins);
  return {
    advance,
    verticalAdvance: (bytes) => sumCodes(bytes, (code) => advances.get(code) ?? defaultAdvance),
    verticalOrigin(bytes) {
      const code = cidCodes(bytes)[0] ?? 0;
      return origins.get(code) ?? { x: (widths.get(code) ?? defaultWidth) / 2, y: defaultOriginY };
    }
  };
}
function readVerticalWidths(entries, advances, origins) {
  for (let index = 0; index < entries.length; ) {
    const first = entries[index];
    const next = entries[index + 1];
    if (typeof first !== "number") break;
    if (Array.isArray(next)) {
      for (let offset = 0; offset + 2 < next.length; offset += 3) {
        setVerticalMetric(
          first + offset / 3,
          next[offset],
          next[offset + 1],
          next[offset + 2],
          advances,
          origins
        );
      }
      index += 2;
      continue;
    }
    const last = next;
    const verticalWidth = entries[index + 2];
    const originX = entries[index + 3];
    const originY = entries[index + 4];
    if (typeof last !== "number") break;
    for (let code = first; code <= last && code - first <= 65536; code += 1)
      setVerticalMetric(code, verticalWidth, originX, originY, advances, origins);
    index += 5;
  }
}
function setVerticalMetric(code, verticalWidth, originX, originY, advances, origins) {
  if (typeof verticalWidth === "number") advances.set(code, -verticalWidth / 1e3);
  if (typeof originX === "number" && typeof originY === "number")
    origins.set(code, { x: originX / 1e3, y: originY / 1e3 });
}
function sumCodes(bytes, value) {
  let total = 0;
  for (const code of cidCodes(bytes)) total += value(code);
  return total;
}
function cidCodes(bytes) {
  const output = [];
  for (let index = 0; index + 1 < bytes.length; index += 2)
    output.push((bytes[index] ?? 0) << 8 | (bytes[index + 1] ?? 0));
  return output;
}
var encoder = new TextEncoder();
var eexecMarker = encoder.encode("currentfile eexec");
function parseType1Metrics(bytes) {
  const program = unwrapType1Program(bytes);
  const marker = findBytes(program, eexecMarker);
  if (marker < 0) return void 0;
  const clear = new TextDecoder("latin1").decode(program.subarray(0, marker));
  const encrypted = eexecBytes(program, marker + eexecMarker.length);
  if (!encrypted) return void 0;
  const privateProgram = decrypt(encrypted, 55665, 4);
  const privateText = new TextDecoder("latin1").decode(privateProgram);
  const lenIV = Number(/\/lenIV\s+(-?\d+)/.exec(privateText)?.[1] ?? 4);
  if (!Number.isInteger(lenIV) || lenIV < -1 || lenIV > 32) return void 0;
  const matrix = /\/FontMatrix\s*\[\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i.exec(clear);
  const scale = Math.abs(Number(matrix?.[1] ?? 1e-3));
  if (!Number.isFinite(scale) || scale === 0 || scale > 1) return void 0;
  const subroutines = readBinaryEntries(
    privateProgram,
    privateText,
    /dup\s+(\d+)\s+(\d+)\s+(?:RD|-\|)\s/g,
    lenIV
  );
  const widths = readCharStrings(privateProgram, privateText, lenIV, scale, subroutines);
  if (widths.size === 0) return void 0;
  return { widthOfGlyph: (glyph) => widths.get(glyph) };
}
function readCharStrings(bytes, text, lenIV, scale, subroutines) {
  const widths = /* @__PURE__ */ new Map();
  const pattern = /\/([^\s/]+)\s+(\d+)\s+(?:RD|-\|)\s/g;
  for (const match of text.matchAll(pattern)) {
    const glyph = match[1];
    const length = Number(match[2]);
    const start = match.index + match[0].length;
    if (!glyph || !Number.isSafeInteger(length) || length < 0 || start + length > bytes.length)
      continue;
    const encoded = bytes.subarray(start, start + length);
    const charString = lenIV < 0 ? encoded : decrypt(encoded, 4330, lenIV);
    const width = readCharStringWidth(charString, subroutines);
    if (width !== void 0) widths.set(glyph, width * scale);
  }
  return widths;
}
function readBinaryEntries(bytes, text, pattern, lenIV) {
  const output = /* @__PURE__ */ new Map();
  for (const match of text.matchAll(pattern)) {
    const key = Number(match[1]);
    const length = Number(match[2]);
    const start = match.index + match[0].length;
    if (!Number.isSafeInteger(key) || !Number.isSafeInteger(length) || length < 0) continue;
    if (start + length > bytes.length) continue;
    const encoded = bytes.subarray(start, start + length);
    output.set(key, lenIV < 0 ? encoded : decrypt(encoded, 4330, lenIV));
  }
  return output;
}
function readCharStringWidth(bytes, subroutines) {
  return interpretCharString(bytes, subroutines, [], 0, { operations: 0 });
}
function interpretCharString(bytes, subroutines, stack, depth, work) {
  if (depth > 16) return void 0;
  for (let index = 0; index < bytes.length; ) {
    work.operations += 1;
    if (work.operations > 1e5) return void 0;
    const value = bytes[index];
    index += 1;
    if (value >= 32) {
      const decoded = decodeNumber(bytes, value, index);
      if (!decoded) return void 0;
      stack.push(decoded.value);
      index = decoded.next;
      if (stack.length > 48) return void 0;
      continue;
    }
    if (value === 13) return stack.length >= 2 ? stack.at(-1) : void 0;
    if (value === 10) {
      const subroutine = subroutines.get(stack.pop() ?? -1);
      if (!subroutine) return void 0;
      const width = interpretCharString(subroutine, subroutines, stack, depth + 1, work);
      if (width !== void 0) return width;
      continue;
    }
    if (value === 11) return void 0;
    if (value === 12) {
      const escaped = bytes[index];
      index += 1;
      if (escaped === 7) return stack.length >= 4 ? stack.at(-2) : void 0;
      if (escaped === 12 && stack.length >= 2) {
        const divisor = stack.pop();
        const dividend = stack.pop();
        if (divisor === 0) return void 0;
        stack.push(dividend / divisor);
        continue;
      }
    }
    stack.length = 0;
  }
  return void 0;
}
function decodeNumber(bytes, first, index) {
  if (first <= 246) return { value: first - 139, next: index };
  if (first <= 250 && index < bytes.length)
    return { value: (first - 247) * 256 + bytes[index] + 108, next: index + 1 };
  if (first <= 254 && index < bytes.length)
    return { value: -(first - 251) * 256 - bytes[index] - 108, next: index + 1 };
  if (first === 255 && index + 4 <= bytes.length) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + index, 4);
    return { value: view.getInt32(0), next: index + 4 };
  }
  return void 0;
}
function eexecBytes(bytes, offset) {
  while (offset < bytes.length && isSpace(bytes[offset])) offset += 1;
  const sample = bytes.subarray(offset, Math.min(bytes.length, offset + 8));
  const isHex = sample.length >= 8 && [...sample].every(isHexDigit);
  if (!isHex) return bytes.subarray(offset);
  const output = [];
  let high;
  for (let index = offset; index < bytes.length; index += 1) {
    const byte = bytes[index];
    if (isSpace(byte)) continue;
    const nibble = hexValue(byte);
    if (nibble < 0) break;
    if (high === void 0) high = nibble;
    else {
      output.push(high << 4 | nibble);
      high = void 0;
    }
  }
  return output.length > 0 ? Uint8Array.from(output) : void 0;
}
function decrypt(bytes, key, discard) {
  const output = new Uint8Array(Math.max(0, bytes.length - discard));
  for (let index = 0; index < bytes.length; index += 1) {
    const cipher = bytes[index];
    const plain = cipher ^ key >> 8;
    key = (cipher + key) * 52845 + 22719 & 65535;
    if (index >= discard) output[index - discard] = plain;
  }
  return output;
}
function unwrapType1Program(bytes) {
  if (bytes[0] !== 128) return bytes;
  const chunks = [];
  let length = 0;
  for (let offset2 = 0; offset2 + 6 <= bytes.length; ) {
    if (bytes[offset2] !== 128) break;
    const type = bytes[offset2 + 1];
    if (type === 3) break;
    const size = new DataView(bytes.buffer, bytes.byteOffset + offset2 + 2, 4).getUint32(0, true);
    offset2 += 6;
    if (type !== 1 && type !== 2 || size > bytes.length - offset2) break;
    chunks.push(bytes.subarray(offset2, offset2 + size));
    length += size;
    offset2 += size;
  }
  if (chunks.length === 0) return bytes;
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}
function isSpace(byte) {
  return byte === 0 || byte === 9 || byte === 10 || byte === 12 || byte === 13 || byte === 32;
}
function isHexDigit(byte) {
  return hexValue(byte) >= 0;
}
function hexValue(byte) {
  if (byte >= 48 && byte <= 57) return byte - 48;
  if (byte >= 65 && byte <= 70) return byte - 55;
  if (byte >= 97 && byte <= 102) return byte - 87;
  return -1;
}
var glyphNames = {
  space: " ",
  acute: "\xB4",
  asteriskmath: "\u2217",
  ampersand: "&",
  bullet: "\u2022",
  copyright: "\xA9",
  circlecopyrt: "\xA9",
  dieresis: "\xA8",
  comma: ",",
  period: ".",
  quotedblleft: "\u201C",
  quotedblright: "\u201D",
  quoteleft: "\u2018",
  quoteright: "\u2019",
  hyphen: "-",
  slash: "/",
  parenleft: "(",
  parenright: ")",
  numbersign: "#",
  dollar: "$",
  percent: "%",
  plus: "+",
  colon: ":",
  semicolon: ";",
  less: "<",
  bracketleft: "[",
  bracketright: "]",
  braceleft: "{",
  braceright: "}",
  ae: "\xE6",
  AE: "\xC6",
  oslash: "\xF8",
  Oslash: "\xD8",
  oe: "\u0153",
  OE: "\u0152",
  ff: "ff",
  fi: "fi",
  fl: "fl",
  ffi: "ffi",
  ffl: "ffl",
  germandbls: "\xDF",
  dotlessi: "\u0131",
  uacute: "\xFA",
  Uacute: "\xDA",
  aacute: "\xE1",
  Aacute: "\xC1",
  iacute: "\xED",
  Iacute: "\xCD",
  yacute: "\xFD",
  Yacute: "\xDD",
  ccaron: "\u010D",
  Ccaron: "\u010C",
  rcaron: "\u0159",
  Rcaron: "\u0158",
  scaron: "\u0161",
  Scaron: "\u0160",
  zcaron: "\u017E",
  Zcaron: "\u017D",
  ecaron: "\u011B",
  Ecaron: "\u011A",
  uring: "\u016F",
  Uring: "\u016E",
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9"
};
async function loadFontEncoding(reader, font, recoverCidUnicode = true) {
  const fontFamily = baseFontName(font);
  const encodingValue = font.get("Encoding");
  const encoding = encodingValue === void 0 ? void 0 : await reader.resolve(encodingValue);
  const baseEncoding = isDict(encoding) ? encoding.get("BaseEncoding") : void 0;
  const embeddedEncoding = encoding === void 0 ? await embeddedFontEncoding(reader, font) : void 0;
  const baseName = isName(encoding) ? encoding.value : isName(baseEncoding) ? baseEncoding.value : typeof embeddedEncoding === "string" ? embeddedEncoding : "StandardEncoding";
  const table = Array.isArray(embeddedEncoding) ? embeddedEncoding : baseTable(baseName);
  const glyphTable = table.map((character) => glyphNameForCharacter(character, baseName));
  if (isDict(encoding)) {
    applyDifferences(
      table,
      encoding.get("Differences"),
      !isName(font.get("Subtype"), "Type3"),
      glyphTable
    );
  }
  const cidMetrics = await loadCidMetrics(reader, font, encoding);
  const cidUnicode = recoverCidUnicode ? await embeddedCidUnicodeDecoder(reader, font) : void 0;
  const widths = cidMetrics?.advance ?? await loadFontWidths(reader, font, table, glyphTable);
  return {
    decode: cidUnicode ?? ((bytes) => [...bytes].map((byte) => table[byte]).join("")),
    ...fontFamily ? { fontFamily } : {},
    ...widths ? { advance: (bytes) => widths(bytes) } : {},
    ...cidMetrics?.verticalAdvance ? {
      verticalAdvance: cidMetrics.verticalAdvance,
      verticalOrigin: cidMetrics.verticalOrigin,
      writingMode: "vertical"
    } : {}
  };
}
function baseFontName(font) {
  const value = font.get("BaseFont");
  return isName(value) ? stripSubsetPrefix(value.value) : void 0;
}
function stripSubsetPrefix(value) {
  return value.replace(/^[A-Za-z]{6}\+/, "").replace(/^[A-Za-z]{6}(?=(?:Minion|Myriad))/i, "");
}
async function loadFontWidths(reader, font, characterTable, glyphTable) {
  const missingWidth = await loadMissingWidth(reader, font);
  const standardWidths = standardFontWidths(font, glyphTable);
  const value = font.get("Widths");
  if (value === void 0) {
    const embeddedWidths = await embeddedFontWidths(reader, font, characterTable, glyphTable);
    return embeddedWidths ?? standardWidths ?? constantWidth(missingWidth);
  }
  const resolved = await reader.resolve(value);
  if (!Array.isArray(resolved)) {
    const embeddedWidths = await embeddedFontWidths(reader, font, characterTable, glyphTable);
    return embeddedWidths ?? standardWidths ?? constantWidth(missingWidth);
  }
  const first = typeof font.get("FirstChar") === "number" ? font.get("FirstChar") : 0;
  const widths = resolved.map((width) => typeof width === "number" ? width / 1e3 : void 0);
  return (bytes) => {
    let total = 0;
    for (const byte of bytes) {
      total += widths[byte - first] ?? widthFromStandardFont(standardWidths, byte) ?? missingWidth ?? 0.5;
    }
    return total;
  };
}
async function embeddedFontWidths(reader, font, characterTable, glyphTable) {
  const isTrueType = isName(font.get("Subtype"), "TrueType");
  const isType1 = isName(font.get("Subtype"), "Type1") || isName(font.get("Subtype"), "MMType1");
  if (!isTrueType && !isType1) return void 0;
  const descriptor = await reader.resolveDict(font.get("FontDescriptor"));
  const value = descriptor?.get(isTrueType ? "FontFile2" : "FontFile");
  if (value === void 0) return void 0;
  const stream = await reader.resolve(value);
  if (!isStream(stream)) return void 0;
  const bytes = await reader.decodeStream(stream);
  if (isTrueType) {
    const metrics22 = parseTrueTypeMetrics(bytes);
    if (!metrics22) return void 0;
    return (encoded) => {
      let total = 0;
      for (const byte of encoded) {
        const character = characterTable[byte] ?? "";
        for (const value2 of character) {
          total += metrics22.widthOfCodePoint(value2.codePointAt(0) ?? 0) ?? 0.5;
        }
      }
      return total;
    };
  }
  const metrics2 = parseType1Metrics(bytes);
  if (!metrics2) return void 0;
  return (encoded) => {
    let total = 0;
    for (const byte of encoded) total += metrics2.widthOfGlyph(glyphTable[byte] ?? ".notdef") ?? 0.5;
    return total;
  };
}
async function loadMissingWidth(reader, font) {
  const value = font.get("FontDescriptor");
  if (value === void 0) return void 0;
  const descriptor = await reader.resolveDict(value);
  const width = descriptor?.get("MissingWidth");
  return typeof width === "number" && Number.isFinite(width) ? width / 1e3 : void 0;
}
function constantWidth(width) {
  return width === void 0 ? void 0 : (bytes) => bytes.length * width;
}
var standardFontNames = /* @__PURE__ */ new Set([
  "Courier",
  "Courier-Bold",
  "Courier-Oblique",
  "Courier-BoldOblique",
  "Helvetica",
  "Helvetica-Bold",
  "Helvetica-Oblique",
  "Helvetica-BoldOblique",
  "Times-Roman",
  "Times-Bold",
  "Times-Italic",
  "Times-BoldItalic",
  "Symbol",
  "ZapfDingbats"
]);
function standardFontWidths(font, glyphTable) {
  const baseFont = font.get("BaseFont");
  if (!isName(baseFont)) return void 0;
  const name = stripSubsetPrefix(baseFont.value);
  if (!standardFontNames.has(name)) return void 0;
  const metrics2 = Font.load(name);
  return (bytes) => {
    let total = 0;
    for (const byte of bytes)
      total += (metrics2.getWidthOfGlyph(glyphTable[byte] ?? ".notdef") ?? 0) / 1e3;
    return total;
  };
}
function widthFromStandardFont(advance, byte) {
  return advance?.(Uint8Array.of(byte));
}
function glyphNameForCharacter(character, encodingName) {
  const codePoint = character.codePointAt(0);
  if (codePoint === void 0) return void 0;
  const encoding = encodingName === "Symbol" ? Encodings.Symbol : encodingName === "ZapfDingbats" ? Encodings.ZapfDingbats : Encodings.WinAnsi;
  return encoding.canEncodeUnicodeCodePoint(codePoint) ? encoding.encodeUnicodeCodePoint(codePoint).name : void 0;
}
async function embeddedFontEncoding(reader, font) {
  const descriptorValue = font.get("FontDescriptor");
  if (descriptorValue === void 0) return void 0;
  const descriptor = await reader.resolveDict(descriptorValue);
  const isTrueType = isName(font.get("Subtype"), "TrueType");
  const fontFileValue = descriptor?.get(isTrueType ? "FontFile2" : "FontFile");
  if (fontFileValue === void 0) return void 0;
  const fontFile = await reader.resolve(fontFileValue);
  if (!isStream(fontFile)) return void 0;
  const bytes = await reader.decodeStream(fontFile);
  return isTrueType ? detectTrueTypeBaseEncoding(bytes) : parseType1Encoding(bytes);
}
function parseType1Encoding(bytes) {
  bytes = unwrapType1Program(bytes);
  const eexec = new TextEncoder().encode("currentfile eexec");
  const marker = findBytes(bytes, eexec);
  const clearLength = marker < 0 ? Math.min(bytes.length, 64 * 1024) : marker;
  const text = new TextDecoder("latin1").decode(bytes.subarray(0, clearLength));
  if (!/\/Encoding\s+256\s+array/.test(text)) return void 0;
  const table = baseTable("StandardEncoding");
  let found = false;
  for (const match of text.matchAll(/dup\s+(\d+)\s+\/([^\s]+)\s+put/g)) {
    const code = Number(match[1]);
    const name = match[2];
    const unicode = name === void 0 ? void 0 : glyphNameToUnicode(name);
    if (code >= 0 && code <= 255 && unicode !== void 0) {
      table[code] = unicode;
      found = true;
    }
  }
  return found ? table : void 0;
}
function detectTrueTypeBaseEncoding(bytes) {
  if (bytes.length < 12) return void 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tableCount = view.getUint16(4);
  for (let index = 0; index < tableCount; index += 1) {
    const record = 12 + index * 16;
    if (record + 16 > bytes.length) return void 0;
    const tag = new TextDecoder("latin1").decode(bytes.subarray(record, record + 4));
    if (tag !== "cmap") continue;
    const offset = view.getUint32(record + 8);
    if (offset + 4 > bytes.length) return void 0;
    const subtableCount = view.getUint16(offset + 2);
    let hasMacintosh = false;
    let hasWindows = false;
    for (let subtable = 0; subtable < subtableCount; subtable += 1) {
      const subtableRecord = offset + 4 + subtable * 8;
      if (subtableRecord + 8 > bytes.length) return void 0;
      const platform = view.getUint16(subtableRecord);
      if (platform === 1) hasMacintosh = true;
      if (platform === 3 && view.getUint16(subtableRecord + 2) !== 0) hasWindows = true;
    }
    return hasMacintosh && !hasWindows ? "MacRomanEncoding" : void 0;
  }
  return void 0;
}
function baseTable(name) {
  const label = name === "MacRomanEncoding" ? "macintosh" : "windows-1252";
  const decoder2 = new TextDecoder(label);
  const table = Array.from({ length: 256 }, (_, byte) => decoder2.decode(Uint8Array.of(byte)));
  if (label === "windows-1252") {
    table[150] = "\u2013";
    table[151] = "\u2014";
  }
  if (name === "StandardEncoding") applyStandardEncoding(table);
  return table;
}
function applyStandardEncoding(table) {
  const values = {
    161: "\xA1",
    162: "\xA2",
    163: "\xA3",
    164: "\u2044",
    165: "\xA5",
    166: "\u0192",
    167: "\xA7",
    168: "\xA4",
    169: "'",
    170: "\u201C",
    171: "\xAB",
    172: "\u2039",
    173: "\u203A",
    174: "fi",
    175: "fl",
    177: "\u2013",
    178: "\u2020",
    179: "\u2021",
    180: "\xB7",
    182: "\xB6",
    183: "\u2022",
    184: "\u201A",
    185: "\u201E",
    186: "\u201D",
    187: "\xBB",
    188: "\u2026",
    189: "\u2030",
    191: "\xBF",
    193: "`",
    194: "\xB4",
    195: "\u02C6",
    196: "\u02DC",
    197: "\xAF",
    198: "\u02D8",
    199: "\u02D9",
    200: "\xA8",
    202: "\u02DA",
    203: "\xB8",
    205: "\u02DD",
    206: "\u02DB",
    207: "\u02C7",
    208: "\u2014",
    225: "\xC6",
    227: "\xAA",
    232: "\u0141",
    233: "\xD8",
    234: "\u0152",
    235: "\xBA",
    241: "\xE6",
    245: "\u0131",
    248: "\u0142",
    249: "\xF8",
    250: "\u0153",
    251: "\xDF"
  };
  for (const [code, value] of Object.entries(values)) table[Number(code)] = value;
}
function applyDifferences(table, value, allowSyntheticHex = true, glyphTable) {
  if (!Array.isArray(value)) return;
  let code = 0;
  for (const item of value) {
    if (typeof item === "number") {
      code = item;
    } else if (isName(item) && code >= 0 && code <= 255) {
      if (item.value === ".notdef") {
        table[code] = "";
        if (glyphTable) glyphTable[code] = item.value;
        code += 1;
        continue;
      }
      const unicode = !allowSyntheticHex && /^(?:G[0-9a-f]{2,6}|C\d{1,7})$/i.test(item.value) ? void 0 : glyphNameToUnicode(item.value);
      if (unicode !== void 0) table[code] = unicode;
      if (unicode !== void 0 && glyphTable) glyphTable[code] = item.value;
      code += 1;
    }
  }
}
function glyphNameToUnicode(name) {
  const known = glyphNames[name];
  if (known !== void 0) return known;
  const plainName = name.split(".")[0];
  const syntheticHex = /^G([0-9a-f]{2,6})$/i.exec(plainName)?.[1];
  if (syntheticHex !== void 0) return String.fromCodePoint(Number.parseInt(syntheticHex, 16));
  const syntheticDecimal = /^C(\d{1,7})$/.exec(plainName)?.[1];
  if (syntheticDecimal !== void 0) {
    const codePoint2 = Number(syntheticDecimal);
    if (codePoint2 <= 1114111) return String.fromCodePoint(codePoint2);
  }
  if (/^[A-Za-z]$/.test(plainName)) return plainName;
  if (/^[A-Za-z](?:_[A-Za-z])+$/.test(plainName)) return plainName.replaceAll("_", "");
  const unicode = /^(?:uni([0-9a-f]{4}(?:[0-9a-f]{4})*)|u([0-9a-f]{4,6}))$/i.exec(plainName);
  const unicodeUnits = unicode?.[1];
  if (unicodeUnits) {
    const units = unicodeUnits.match(/.{4}/g);
    return units.map((unit) => String.fromCodePoint(Number.parseInt(unit, 16))).join("");
  }
  const codePoint = unicode?.[2];
  if (codePoint) return String.fromCodePoint(Number.parseInt(codePoint, 16));
  return void 0;
}
async function extractPageText(reader, page, fontAssets = [], visualSpans) {
  const fonts = await loadFonts(reader, page.resources, fontAssets);
  const streams = await contentStreams(reader, page.dict.get("Contents"));
  const spans = [];
  const state = createTextState();
  state.ctm = pageOriginMatrix(page.mediaBox);
  for (const bytes of streams) {
    await interpret2(
      reader,
      bytes,
      state,
      fonts,
      fontAssets,
      page.resources,
      spans,
      page,
      0,
      /* @__PURE__ */ new Set()
    );
  }
  visualSpans?.push(...spans.map(asVisualSpan));
  return reorderBidiLines(spans);
}
function asVisualSpan(span) {
  const arabic = /[\u0600-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/u.test(span.text);
  return {
    ...span,
    ...arabic ? { text: [...span.text].reverse().join("") } : {},
    bounds: { ...span.bounds }
  };
}
async function interpret2(reader, bytes, state, fonts, fontAssets, resources, spans, page, depth, activeForms) {
  const parser = new ValueParser(bytes);
  const operands = [];
  while (parser.offset < bytes.length) {
    parser.skipSpace();
    if (parser.offset >= bytes.length) break;
    let value;
    try {
      value = parser.parseValue();
    } catch (error) {
      const trailing = bytes.subarray(parser.offset);
      if (trailing.length <= 64 && !containsTextShowingOperator(trailing)) break;
      throw error;
    }
    if (typeof value !== "string") {
      operands.push(value);
      continue;
    }
    await applyOperator2(
      value,
      operands,
      reader,
      state,
      fonts,
      fontAssets,
      resources,
      spans,
      page,
      depth,
      activeForms
    );
    operands.length = 0;
  }
}
async function applyOperator2(operator, args, reader, state, fonts, fontAssets, resources, spans, page, depth, activeForms) {
  switch (operator) {
    case "q":
      state.graphicsStack.push({
        ctm: [...state.ctm],
        fillColor: state.fillColor,
        strokeColor: state.strokeColor,
        lineWidth: state.lineWidth,
        fillColorSpace: state.fillColorSpace,
        strokeColorSpace: state.strokeColorSpace,
        fillOpacity: state.fillOpacity,
        strokeOpacity: state.strokeOpacity
      });
      return;
    case "Q":
      {
        const restored = state.graphicsStack.pop();
        state.ctm = restored?.ctm ?? [...identityMatrix];
        state.fillColor = restored?.fillColor ?? "#000000";
        state.strokeColor = restored?.strokeColor ?? "#000000";
        state.lineWidth = restored?.lineWidth ?? 1;
        state.fillColorSpace = restored?.fillColorSpace;
        state.strokeColorSpace = restored?.strokeColorSpace;
        state.fillOpacity = restored?.fillOpacity ?? 1;
        state.strokeOpacity = restored?.strokeOpacity ?? 1;
      }
      return;
    case "cm":
      if (args.length >= 6 && args.slice(-6).every((value) => typeof value === "number")) {
        state.ctm = multiply2(state.ctm, args.slice(-6));
      }
      return;
    case "gs":
      {
        const extended = await resolveExtendedGraphicsState(reader, resources, args.at(-1));
        if (extended?.lineWidth !== void 0) state.lineWidth = extended.lineWidth;
        if (extended?.fontSize !== void 0) state.fontSize = extended.fontSize;
        if (extended?.fillOpacity !== void 0) state.fillOpacity = extended.fillOpacity;
        if (extended?.strokeOpacity !== void 0) state.strokeOpacity = extended.strokeOpacity;
      }
      return;
    case "g":
    case "rg":
    case "k": {
      state.fillColor = textFillColor(operator, args) ?? state.fillColor;
      return;
    }
    case "cs":
    case "CS": {
      const name = args.at(-1);
      if (isName(name)) {
        if (operator === "cs") state.fillColorSpace = name.value;
        else state.strokeColorSpace = name.value;
      }
      return;
    }
    case "sc":
    case "scn":
      state.fillColor = await componentColor(reader, resources, state.fillColorSpace, args) ?? state.fillColor;
      return;
    case "SC":
    case "SCN":
      state.strokeColor = await componentColor(reader, resources, state.strokeColorSpace, args) ?? state.strokeColor;
      return;
    case "G":
    case "RG":
    case "K": {
      state.strokeColor = textFillColor(operator, args) ?? state.strokeColor;
      return;
    }
    case "w":
      if (typeof args.at(-1) === "number" && args.at(-1) >= 0) {
        state.lineWidth = args.at(-1);
      }
      return;
    case "BT":
      state.textMatrix = [...identityMatrix];
      state.lineMatrix = [...identityMatrix];
      return;
    case "Tf": {
      const name = args.at(-2);
      const size = args.at(-1);
      if (isName(name) && typeof size === "number") {
        state.font = name.value;
        state.fontSize = size;
      }
      return;
    }
    case "Tc":
      if (typeof args.at(-1) === "number") state.charSpacing = args.at(-1);
      return;
    case "Tw":
      if (typeof args.at(-1) === "number") state.wordSpacing = args.at(-1);
      return;
    case "Tz":
      if (typeof args.at(-1) === "number") state.horizontalScale = args.at(-1) / 100;
      return;
    case "TL":
      if (typeof args.at(-1) === "number") state.leading = args.at(-1);
      return;
    case "Ts":
      if (typeof args.at(-1) === "number") state.rise = args.at(-1);
      return;
    case "Tr":
      if (typeof args.at(-1) === "number") {
        const mode = Math.trunc(args.at(-1));
        if (mode >= 0 && mode <= 7) state.renderingMode = mode;
      }
      return;
    case "Tm":
      if (args.length >= 6 && args.slice(-6).every((value) => typeof value === "number")) {
        state.textMatrix = args.slice(-6);
        state.lineMatrix = [...state.textMatrix];
      }
      return;
    case "Td":
    case "TD": {
      const tx = args.at(-2);
      const ty = args.at(-1);
      if (typeof tx === "number" && typeof ty === "number") {
        if (operator === "TD") state.leading = -ty;
        state.lineMatrix = translate(state.lineMatrix, tx, ty);
        state.textMatrix = [...state.lineMatrix];
      }
      return;
    }
    case "T*":
      state.lineMatrix = translate(state.lineMatrix, 0, -state.leading);
      state.textMatrix = [...state.lineMatrix];
      return;
    case "Tj": {
      const text = args.at(-1);
      if (isPdfString(text)) showString(text, state, fonts, spans, page);
      return;
    }
    case "TJ": {
      const array = args.at(-1);
      if (Array.isArray(array)) {
        for (const item of array) {
          if (isPdfString(item)) showString(item, state, fonts, spans, page);
          else if (typeof item === "number") {
            const vertical = fonts.get(state.font ?? "")?.writingMode === "vertical";
            state.textMatrix = translate(
              state.textMatrix,
              vertical ? 0 : -item / 1e3 * state.fontSize * state.horizontalScale,
              vertical ? -item / 1e3 * state.fontSize : 0
            );
          }
        }
      }
      return;
    }
    case "'": {
      state.lineMatrix = translate(state.lineMatrix, 0, -state.leading);
      state.textMatrix = [...state.lineMatrix];
      const text = args.at(-1);
      if (isPdfString(text)) showString(text, state, fonts, spans, page);
      return;
    }
    case '"': {
      const word = args.at(-3);
      const char = args.at(-2);
      const text = args.at(-1);
      if (typeof word === "number") state.wordSpacing = word;
      if (typeof char === "number") state.charSpacing = char;
      state.lineMatrix = translate(state.lineMatrix, 0, -state.leading);
      state.textMatrix = [...state.lineMatrix];
      if (isPdfString(text)) showString(text, state, fonts, spans, page);
      return;
    }
    case "Do": {
      const name = args.at(-1);
      if (!isName(name)) return;
      if (depth >= reader.limits.maxFormDepth) return;
      const xObjects = await reader.resolveDict(resources?.get("XObject"));
      const xObject = xObjects?.get(name.value);
      if (!xObject) return;
      const objectNumber = isRef(xObject) ? xObject.object : void 0;
      if (objectNumber !== void 0 && activeForms.has(objectNumber)) return;
      const resolved = await reader.resolve(xObject);
      if (!isStream(resolved) || !isName(resolved.dict.get("Subtype"), "Form")) return;
      const resourceValue = resolved.dict.get("Resources");
      const resolvedResources = resourceValue === void 0 ? void 0 : await reader.resolve(resourceValue);
      const formResources = isDict(resolvedResources) ? resolvedResources : resources;
      const formFonts = await loadFonts(reader, formResources, fontAssets);
      const matrix = pdfMatrix2(resolved.dict.get("Matrix")) ?? identityMatrix;
      const saved = cloneTextState(state);
      state.ctm = multiply2(state.ctm, matrix);
      const nestedForms = new Set(activeForms);
      if (objectNumber !== void 0) nestedForms.add(objectNumber);
      try {
        try {
          await interpret2(
            reader,
            await reader.decodeStream(resolved),
            state,
            formFonts,
            fontAssets,
            formResources,
            spans,
            page,
            depth + 1,
            nestedForms
          );
        } catch (error) {
          if (!(error instanceof Error) || !/invalid PDF number/.test(error.message)) throw error;
        }
      } finally {
        restoreTextState(state, saved);
      }
      return;
    }
  }
}
function showString(value, state, fonts, spans, page) {
  const font = fonts.get(state.font ?? "");
  const vertical = font?.writingMode === "vertical";
  let bytes = font?.codeUnitBytes === 1 ? collapseZeroPaddedSingleByteCodes(value.bytes) : value.bytes;
  let text = normalizeTextCompatibility(font?.decode(bytes) ?? decodePdfString(bytes));
  const leadingSpaces = /^ +/.exec(text)?.[0] ?? "";
  const hasLeadingSpace = leadingSpaces.length > 0;
  if (leadingSpaces) {
    if (bytes.length === text.length) {
      const leadingBytes = bytes.subarray(0, leadingSpaces.length);
      const advance = textAdvance(leadingBytes, leadingSpaces, state, font);
      state.textMatrix = translate(
        state.textMatrix,
        vertical ? 0 : advance,
        vertical ? -advance : 0
      );
      bytes = bytes.subarray(leadingSpaces.length);
    } else {
      const advance = approximateAdvance(leadingSpaces, state, vertical);
      state.textMatrix = translate(
        state.textMatrix,
        vertical ? 0 : advance,
        vertical ? -advance : 0
      );
    }
    text = text.slice(leadingSpaces.length);
  }
  if (!text) return;
  const width = textAdvance(bytes, text, state, font);
  const visible = visibleText(bytes, text, state, font, page);
  if (!visible) {
    state.textMatrix = translate(state.textMatrix, vertical ? 0 : width, vertical ? -width : 0);
    return;
  }
  const visibleMatrix = translate(
    state.textMatrix,
    vertical ? 0 : visible.offset,
    vertical ? -visible.offset : 0
  );
  const [x, y] = transformPoint2(state.ctm, visibleMatrix[4], visibleMatrix[5] + state.rise);
  const endMatrix = translate(
    visibleMatrix,
    vertical ? 0 : visible.width,
    vertical ? -visible.width : 0
  );
  const [endX, endY] = transformPoint2(state.ctm, endMatrix[4], endMatrix[5] + state.rise);
  const topMatrix = translate(
    visibleMatrix,
    vertical ? Math.abs(state.fontSize) * state.horizontalScale : 0,
    vertical ? 0 : Math.abs(state.fontSize)
  );
  const [topX, topY] = transformPoint2(state.ctm, topMatrix[4], topMatrix[5] + state.rise);
  const advanceLength = Math.hypot(endX - x, endY - y);
  const ascentLength = Math.hypot(topX - x, topY - y);
  spans.push({
    text: visible.text,
    ...hasLeadingSpace ? { hasLeadingSpace: true } : {},
    bounds: {
      x,
      y,
      width: vertical ? ascentLength : advanceLength,
      height: vertical ? advanceLength : ascentLength
    },
    direction: vertical ? "ttb" : "ltr",
    fontName: state.font,
    ...font?.fontFamily ? { fontFamily: font.fontFamily } : {},
    ...font?.fontAssetId ? { fontAssetId: font.fontAssetId } : {},
    ...font?.fontFormat === "type3" ? { glyphCodes: [...bytes] } : {},
    color: state.fillColor,
    ...state.fillOpacity !== 1 ? { fillOpacity: state.fillOpacity } : {},
    ...state.renderingMode === 1 || state.renderingMode === 2 || state.renderingMode === 5 || state.renderingMode === 6 ? {
      strokeColor: state.strokeColor,
      strokeWidth: effectiveLineWidth(state.ctm, state.lineWidth),
      ...state.strokeOpacity !== 1 ? { strokeOpacity: state.strokeOpacity } : {}
    } : {},
    ...state.renderingMode !== 0 ? { renderingMode: state.renderingMode } : {},
    fontSize: ascentLength,
    ...!vertical && advanceLength > 0 && ascentLength > 0 ? {
      transform: [
        (endX - x) / advanceLength,
        -(endY - y) / advanceLength,
        -(topX - x) / ascentLength,
        (topY - y) / ascentLength
      ]
    } : {},
    source: { page: 0, objectNumber: page.ref.object }
  });
  state.textMatrix = translate(state.textMatrix, vertical ? 0 : width, vertical ? -width : 0);
}
function visibleText(bytes, text, state, font, page) {
  if (!font?.advance || bytes.length !== text.length)
    return { text, offset: 0, width: textAdvance(bytes, text, state, font) };
  const [boxX1, boxY1, boxX2, boxY2] = page.mediaBox;
  const minX = 0;
  const minY = 0;
  const maxX = Math.abs(boxX2 - boxX1);
  const maxY = Math.abs(boxY2 - boxY1);
  let offset = 0;
  let first = -1;
  let last = -1;
  let firstOffset = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    const vertical = font.writingMode === "vertical";
    const matrix = translate(state.textMatrix, vertical ? 0 : offset, vertical ? -offset : 0);
    const [x, y] = transformPoint2(state.ctm, matrix[4], matrix[5] + state.rise);
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      if (first < 0) {
        first = index;
        firstOffset = offset;
      }
      last = index + 1;
    }
    const character = text[index] ?? "";
    offset += textAdvance(bytes.subarray(index, index + 1), character, state, font);
  }
  if (first < 0 || last < 0) return void 0;
  const visibleBytes = bytes.subarray(first, last);
  const visible = text.slice(first, last);
  return {
    text: visible,
    offset: firstOffset,
    width: textAdvance(visibleBytes, visible, state, font)
  };
}
async function loadFonts(reader, resources, fontAssets = []) {
  const output = /* @__PURE__ */ new Map();
  if (!resources) return output;
  const fonts = await reader.resolveDict(resources.get("Font"));
  if (!fonts) return output;
  for (const [name, value] of fonts) {
    const font = await reader.resolveDict(value);
    if (!font) continue;
    const toUnicodeValue = font.get("ToUnicode");
    const encoding = await loadFontEncoding(reader, font, toUnicodeValue === void 0);
    const fontAssetId = `font-${fontAssets.length + 1}`;
    const asset = await extractType3Font(reader, font, fontAssetId, encoding.fontFamily) ?? await extractTrueTypeFont(reader, font, fontAssetId, encoding.fontFamily);
    if (asset) {
      if (asset.format === "truetype") {
        const cidMappings = await loadCidUnicodeGlyphMap(reader, font, toUnicodeValue);
        const symbolicMappings = cidMappings.size > 0 ? /* @__PURE__ */ new Map() : await symbolicTrueTypeGlyphMap(reader, font, asset.data, encoding);
        const mappings = cidMappings.size > 0 ? cidMappings : symbolicMappings;
        asset.data = remapTrueTypeCmap(asset.data, mappings) ?? asset.data;
        if (symbolicMappings.size > 0) asset.visualCodeMapping = true;
      }
      fontAssets.push(asset);
      encoding.fontAssetId = fontAssetId;
      encoding.fontFormat = asset.format;
      if (asset.format === "type3") {
        const advances = new Map(asset.glyphs.map((glyph) => [glyph.code, glyph.advance]));
        encoding.advance = (bytes) => [...bytes].reduce((total, code) => total + (advances.get(code) ?? 0), 0);
      }
    }
    if (toUnicodeValue) {
      const toUnicode = await reader.resolve(toUnicodeValue);
      if (isStream(toUnicode)) {
        const unicodeMap = parseToUnicode(await reader.decodeStream(toUnicode));
        const codeBytes = unicodeMap.codeBytes ?? (isName(font.get("Subtype"), "Type0") ? 2 : 1);
        output.set(name, {
          decode: (bytes) => decodeWithMap(bytes, unicodeMap, codeBytes, encoding),
          codeUnitBytes: codeBytes === 2 ? 2 : 1,
          ...encoding.fontFamily ? { fontFamily: encoding.fontFamily } : {},
          ...encoding.fontAssetId ? { fontAssetId: encoding.fontAssetId } : {},
          ...encoding.fontFormat ? { fontFormat: encoding.fontFormat } : {},
          ...encoding.advance ? { advance: encoding.advance } : {},
          ...encoding.verticalAdvance ? { verticalAdvance: encoding.verticalAdvance } : {},
          ...encoding.verticalOrigin ? { verticalOrigin: encoding.verticalOrigin } : {},
          ...encoding.writingMode ? { writingMode: encoding.writingMode } : {}
        });
        continue;
      }
    }
    const namedEncoding = font.get("Encoding");
    if (isName(font.get("Subtype"), "Type0") && isName(namedEncoding) && /-UTF16-(?:H|V)$/.test(namedEncoding.value)) {
      output.set(name, {
        decode: decodeUtf16Bytes,
        codeUnitBytes: 2,
        ...encoding.fontFamily ? { fontFamily: encoding.fontFamily } : {},
        ...encoding.fontAssetId ? { fontAssetId: encoding.fontAssetId } : {},
        ...encoding.fontFormat ? { fontFormat: encoding.fontFormat } : {},
        ...encoding.advance ? { advance: encoding.advance } : {},
        ...encoding.verticalAdvance ? { verticalAdvance: encoding.verticalAdvance } : {},
        ...encoding.verticalOrigin ? { verticalOrigin: encoding.verticalOrigin } : {},
        ...encoding.writingMode ? { writingMode: encoding.writingMode } : {}
      });
      continue;
    }
    encoding.codeUnitBytes = isName(font.get("Subtype"), "Type0") ? 2 : 1;
    output.set(name, encoding);
  }
  return output;
}
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var DEFAULT_MAX_BYTES = 16 * 1024 * 1024;
var SparseByteStore = class {
  source;
  chunkSize;
  maxBytes;
  #chunks = /* @__PURE__ */ new Map();
  #pending = /* @__PURE__ */ new Map();
  #clock = 0;
  #stats = {
    sourceBytesRead: 0,
    sourceReadCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    residentBytes: 0,
    peakResidentBytes: 0,
    largestSourceRead: 0
  };
  constructor(source, options = {}) {
    this.source = source;
    this.chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
    this.maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    if (!Number.isSafeInteger(this.chunkSize) || this.chunkSize <= 0) {
      throw new RangeError("chunkSize must be a positive safe integer");
    }
    if (!Number.isSafeInteger(this.maxBytes) || this.maxBytes < this.chunkSize) {
      throw new RangeError("maxBytes must be a safe integer at least as large as chunkSize");
    }
  }
  get stats() {
    return { ...this.#stats };
  }
  async read(offset, length) {
    validateRange2(this.source.size, offset, length);
    if (length === 0) return new Uint8Array();
    const result = new Uint8Array(length);
    const first = Math.floor(offset / this.chunkSize);
    const last = Math.floor((offset + length - 1) / this.chunkSize);
    let written = 0;
    for (let index = first; index <= last; index += 1) {
      const chunk = await this.#getChunk(index);
      const chunkStart = index * this.chunkSize;
      const from = Math.max(offset, chunkStart) - chunkStart;
      const to = Math.min(offset + length, chunkStart + chunk.byteLength) - chunkStart;
      result.set(chunk.subarray(from, to), written);
      written += to - from;
    }
    return result;
  }
  clear() {
    this.#chunks.clear();
    this.#stats.residentBytes = 0;
  }
  async #getChunk(index) {
    const cached = this.#chunks.get(index);
    if (cached) {
      cached.usedAt = ++this.#clock;
      this.#stats.cacheHits += 1;
      return cached.bytes;
    }
    this.#stats.cacheMisses += 1;
    const existing = this.#pending.get(index);
    if (existing) return existing;
    const pending = this.#loadChunk(index);
    this.#pending.set(index, pending);
    try {
      return await pending;
    } finally {
      this.#pending.delete(index);
    }
  }
  async #loadChunk(index) {
    const offset = index * this.chunkSize;
    const length = Math.min(this.chunkSize, this.source.size - offset);
    const bytes = await this.source.read(offset, length);
    if (bytes.byteLength !== length) {
      throw new Error(
        `source returned ${bytes.byteLength} bytes for a ${length}-byte read at ${offset}`
      );
    }
    this.#stats.sourceBytesRead += length;
    this.#stats.sourceReadCount += 1;
    this.#stats.largestSourceRead = Math.max(this.#stats.largestSourceRead, length);
    this.#evictFor(length, index);
    this.#chunks.set(index, { bytes, usedAt: ++this.#clock });
    this.#stats.residentBytes += length;
    this.#stats.peakResidentBytes = Math.max(
      this.#stats.peakResidentBytes,
      this.#stats.residentBytes
    );
    return bytes;
  }
  #evictFor(incomingBytes, protectedIndex) {
    while (this.#stats.residentBytes + incomingBytes > this.maxBytes) {
      let oldestIndex;
      let oldestUse = Number.POSITIVE_INFINITY;
      for (const [index, chunk] of this.#chunks) {
        if (index !== protectedIndex && chunk.usedAt < oldestUse) {
          oldestIndex = index;
          oldestUse = chunk.usedAt;
        }
      }
      if (oldestIndex === void 0) return;
      const removed = this.#chunks.get(oldestIndex);
      this.#chunks.delete(oldestIndex);
      this.#stats.residentBytes -= removed?.bytes.byteLength ?? 0;
    }
  }
};
function validateRange2(size, offset, length) {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(length) || length < 0) {
    throw new RangeError("offset and length must be non-negative safe integers");
  }
  if (offset > size || length > size - offset) {
    throw new RangeError(
      `requested range [${offset}, ${offset + length}) exceeds source size ${size}`
    );
  }
}
var latin12 = new TextDecoder("latin1");
async function decodeFlate(bytes, parameters, limit) {
  const inflated = await inflate2(bytes, limit);
  return applyPredictor(inflated, parameters, limit);
}
function decodeLzw(bytes, parameters, limit) {
  const earlyChange = integerParameter(parameters, "EarlyChange", 1);
  if (earlyChange !== 0 && earlyChange !== 1) throw new Error("/EarlyChange must be 0 or 1");
  const dictionary = Array.from({ length: 256 }, (_, value) => Uint8Array.of(value));
  let nextCode = 258;
  let width = 9;
  let bitOffset = 0;
  let previous;
  const output = [];
  while (bitOffset + width <= bytes.length * 8) {
    const code = readBits(bytes, bitOffset, width);
    bitOffset += width;
    if (code === 256) {
      dictionary.length = 256;
      nextCode = 258;
      width = 9;
      previous = void 0;
      continue;
    }
    if (code === 257) break;
    const entry = dictionary[code] ?? (code === nextCode && previous ? appendByte(previous, previous[0] ?? 0) : void 0);
    if (!entry) throw new Error(`invalid LZW code ${code}`);
    if (output.length + entry.length > limit) {
      throw new PdfError(
        "RESOURCE_LIMIT",
        `decoded stream exceeds configured limit of ${limit} bytes`
      );
    }
    output.push(...entry);
    if (previous && nextCode < 4096) {
      dictionary[nextCode] = appendByte(previous, entry[0] ?? 0);
      nextCode += 1;
      if (width < 12 && nextCode + earlyChange === 1 << width) width += 1;
    }
    previous = entry;
  }
  return applyPredictor(Uint8Array.from(output), parameters, limit);
}
function applyPredictor(bytes, parameters, limit) {
  const predictor = integerParameter(parameters, "Predictor", 1);
  if (predictor === 1) return bytes;
  const colors = positiveParameter(parameters, "Colors", 1);
  const bits = positiveParameter(parameters, "BitsPerComponent", 8);
  const columns = positiveParameter(parameters, "Columns", 1);
  const rowBytes = Math.ceil(colors * columns * bits / 8);
  const bytesPerPixel = Math.max(1, Math.ceil(colors * bits / 8));
  if (predictor === 2) return decodeTiff(bytes, rowBytes, bytesPerPixel);
  if (predictor >= 10 && predictor <= 15) {
    return decodePng(bytes, rowBytes, bytesPerPixel, limit);
  }
  throw new Error(`unsupported stream predictor ${predictor}`);
}
function decodeAsciiHex(bytes, limit) {
  let hex = latin12.decode(bytes).replace(/\s/g, "");
  const end = hex.indexOf(">");
  if (end >= 0) hex = hex.slice(0, end);
  if (hex.length % 2 === 1) hex += "0";
  if (hex.length / 2 > limit)
    throw new PdfError(
      "RESOURCE_LIMIT",
      `decoded stream exceeds configured limit of ${limit} bytes`
    );
  return Uint8Array.from(hex.match(/../g)?.map((value) => Number.parseInt(value, 16)) ?? []);
}
async function inflate2(bytes, limit) {
  const attempts = [
    { bytes, raw: false },
    { bytes, raw: true }
  ];
  if (bytes.length > 6 && looksLikeZlib(bytes)) {
    attempts.push({ bytes: bytes.subarray(2, bytes.length - 4), raw: true });
  }
  let failure;
  for (const attempt of attempts) {
    try {
      return inflateOnce(attempt.bytes, limit, attempt.raw);
    } catch (error) {
      if (error instanceof PdfError) throw error;
      failure = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw new Error(`FlateDecode failed: ${failure?.message ?? "invalid compressed data"}`);
}
function inflateOnce(bytes, limit, raw) {
  const inflater = new Inflate_1({ chunkSize: Math.min(64 * 1024, limit + 1), raw });
  const chunks = [];
  let size = 0;
  inflater.onData = (chunk) => {
    const decoded = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
    size += decoded.byteLength;
    if (size > limit)
      throw new PdfError(
        "RESOURCE_LIMIT",
        `decoded stream exceeds configured limit of ${limit} bytes`
      );
    chunks.push(decoded);
  };
  inflater.push(bytes, true);
  if (inflater.err) throw new Error(inflater.msg || "invalid compressed data");
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}
function looksLikeZlib(bytes) {
  const header = (bytes[0] ?? 0) << 8 | (bytes[1] ?? 0);
  return (bytes[0] ?? 0) % 16 === 8 && header % 31 === 0;
}
function readBits(bytes, bitOffset, width) {
  let value = 0;
  for (let bit = 0; bit < width; bit += 1) {
    const offset = bitOffset + bit;
    value = value << 1 | (bytes[offset >> 3] ?? 0) >> 7 - (offset & 7) & 1;
  }
  return value;
}
function appendByte(bytes, byte) {
  const output = new Uint8Array(bytes.length + 1);
  output.set(bytes);
  output[bytes.length] = byte;
  return output;
}
function decodeTiff(bytes, rowBytes, bytesPerPixel) {
  if (bytes.length % rowBytes !== 0) throw new Error("TIFF predictor data has a partial row");
  const output = bytes.slice();
  for (let row = 0; row < output.length; row += rowBytes) {
    for (let column = bytesPerPixel; column < rowBytes; column += 1) {
      output[row + column] = (output[row + column] ?? 0) + (output[row + column - bytesPerPixel] ?? 0);
    }
  }
  return output;
}
function decodePng(bytes, rowBytes, bytesPerPixel, limit) {
  const encodedRowBytes = rowBytes + 1;
  if (bytes.length % encodedRowBytes !== 0) throw new Error("PNG predictor data has a partial row");
  const rows = bytes.length / encodedRowBytes;
  const outputSize = rows * rowBytes;
  if (outputSize > limit)
    throw new Error(`decoded stream exceeds configured limit of ${limit} bytes`);
  const output = new Uint8Array(outputSize);
  for (let row = 0; row < rows; row += 1) {
    const filter = bytes[row * encodedRowBytes];
    if (filter === void 0 || filter > 4)
      throw new Error(`unsupported PNG predictor filter ${filter}`);
    const inputOffset = row * encodedRowBytes + 1;
    const outputOffset = row * rowBytes;
    for (let column = 0; column < rowBytes; column += 1) {
      const raw = bytes[inputOffset + column] ?? 0;
      const left = column >= bytesPerPixel ? output[outputOffset + column - bytesPerPixel] ?? 0 : 0;
      const up = row > 0 ? output[outputOffset + column - rowBytes] ?? 0 : 0;
      const upperLeft = row > 0 && column >= bytesPerPixel ? output[outputOffset + column - rowBytes - bytesPerPixel] ?? 0 : 0;
      output[outputOffset + column] = applyPngFilter(filter, raw, left, up, upperLeft);
    }
  }
  return output;
}
function applyPngFilter(filter, raw, left, up, upperLeft) {
  if (filter === 0) return raw;
  if (filter === 1) return raw + left;
  if (filter === 2) return raw + up;
  if (filter === 3) return raw + Math.floor((left + up) / 2);
  return raw + paeth(left, up, upperLeft);
}
function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  return upDistance <= upperLeftDistance ? up : upperLeft;
}
function integerParameter(parameters, name, fallback) {
  const value = parameters?.get(name) ?? fallback;
  if (!Number.isSafeInteger(value)) throw new Error(`/${name} must be an integer`);
  return value;
}
function positiveParameter(parameters, name, fallback) {
  const value = integerParameter(parameters, name, fallback);
  if (value <= 0) throw new Error(`/${name} must be positive`);
  return value;
}
var latin13 = new TextDecoder("latin1");
function scanPdfStructure(bytes, absoluteOffset) {
  const text = latin13.decode(bytes);
  const objects = /* @__PURE__ */ new Map();
  for (const match of text.matchAll(/(?:^|[\r\n])[ \t]*(\d+)[ \t]+(\d+)[ \t]+obj\b/g)) {
    const object = Number(match[1]);
    const generation = Number(match[2]);
    const header = match[0].search(/\d/);
    if (Number.isSafeInteger(object) && Number.isSafeInteger(generation) && header >= 0) {
      objects.set(object, { offset: absoluteOffset + (match.index ?? 0) + header, generation });
    }
  }
  return { objects, root: findTrailerRoot(bytes) };
}
function findStartXref(bytes) {
  const matches = [...latin13.decode(bytes).matchAll(/startxref\s+(\d+)/g)];
  const value = Number(matches.at(-1)?.[1]);
  return Number.isSafeInteger(value) ? value : void 0;
}
function findTrailerRoot(bytes) {
  const text = latin13.decode(bytes);
  const trailerOffset = text.lastIndexOf("trailer");
  if (trailerOffset >= 0) {
    try {
      const parser = new ValueParser(bytes, trailerOffset + "trailer".length);
      const trailer = parser.parseValue();
      const root2 = isDict(trailer) ? trailer.get("Root") : void 0;
      if (isRef(root2)) return root2;
    } catch {
    }
    const rootMatch = /\/Root\s+(\d+)\s+(\d+)\s+R/.exec(text.slice(trailerOffset));
    if (rootMatch) {
      return { type: "ref", object: Number(rootMatch[1]), generation: Number(rootMatch[2]) };
    }
  }
  const xrefStreamRoots = [...text.matchAll(/\/Root\s+(\d+)\s+(\d+)\s+R/g)];
  const root = xrefStreamRoots.at(-1);
  return root ? { type: "ref", object: Number(root[1]), generation: Number(root[2]) } : void 0;
}
var CHUNK_SIZE = 1024;
var BYTES_PER_CHUNK = CHUNK_SIZE * (1 + 8 + 4);
var XrefIndex = class {
  #chunks = /* @__PURE__ */ new Map();
  #maxBytes;
  #size = 0;
  constructor(maxBytes = 16 * 1024 * 1024) {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < BYTES_PER_CHUNK) {
      throw new RangeError(`maxXrefCacheBytes must be at least ${BYTES_PER_CHUNK}`);
    }
    this.#maxBytes = maxBytes;
  }
  get size() {
    return this.#size;
  }
  get residentBytes() {
    return this.#chunks.size * BYTES_PER_CHUNK;
  }
  has(object) {
    const slot = this.#slot(object);
    return slot !== void 0 && slot.chunk.types[this.#slotIndex(object)] !== 0;
  }
  get(object) {
    const slot = this.#slot(object);
    if (!slot) return void 0;
    const index = this.#slotIndex(object);
    const type = slot.chunk.types[index];
    if (type === 1) {
      return {
        kind: "direct",
        offset: slot.chunk.primary[index] ?? 0,
        generation: slot.chunk.secondary[index] ?? 0
      };
    }
    if (type === 2) {
      return {
        kind: "compressed",
        streamObject: slot.chunk.primary[index] ?? 0,
        index: slot.chunk.secondary[index] ?? 0
      };
    }
    return void 0;
  }
  set(object, entry) {
    if (!Number.isSafeInteger(object) || object < 0)
      throw new RangeError("invalid xref object number");
    const chunkNumber = Math.floor(object / CHUNK_SIZE);
    let chunk = this.#chunks.get(chunkNumber);
    if (!chunk) {
      if (this.residentBytes + BYTES_PER_CHUNK > this.#maxBytes) {
        throw new PdfError(
          "RESOURCE_LIMIT",
          `xref index exceeds configured ${this.#maxBytes}-byte cache limit`
        );
      }
      chunk = {
        types: new Uint8Array(CHUNK_SIZE),
        primary: new Float64Array(CHUNK_SIZE),
        secondary: new Uint32Array(CHUNK_SIZE)
      };
      this.#chunks.set(chunkNumber, chunk);
    }
    const index = this.#slotIndex(object);
    if (chunk.types[index] === 0) this.#size += 1;
    chunk.types[index] = entry.kind === "direct" ? 1 : 2;
    chunk.primary[index] = entry.kind === "direct" ? entry.offset : entry.streamObject;
    chunk.secondary[index] = entry.kind === "direct" ? entry.generation : entry.index;
  }
  *values() {
    for (const chunk of this.#chunks.values()) {
      for (let index = 0; index < CHUNK_SIZE; index += 1) {
        const type = chunk.types[index];
        if (type === 1) {
          yield {
            kind: "direct",
            offset: chunk.primary[index] ?? 0,
            generation: chunk.secondary[index] ?? 0
          };
        } else if (type === 2) {
          yield {
            kind: "compressed",
            streamObject: chunk.primary[index] ?? 0,
            index: chunk.secondary[index] ?? 0
          };
        }
      }
    }
  }
  clear() {
    this.#chunks.clear();
    this.#size = 0;
  }
  #slot(object) {
    const chunk = this.#chunks.get(Math.floor(object / CHUNK_SIZE));
    return chunk ? { chunk } : void 0;
  }
  #slotIndex(object) {
    return object % CHUNK_SIZE;
  }
};
var DEFAULT_MAX_OBJECT_BYTES = 16 * 1024 * 1024;
var DEFAULT_MAX_DECODED_STREAM_BYTES = 32 * 1024 * 1024;
var DEFAULT_MAX_XREF_BYTES = 8 * 1024 * 1024;
var DEFAULT_MAX_PAGE_TREE_DEPTH = 128;
var DEFAULT_MAX_FORM_DEPTH = 32;
var DEFAULT_MAX_CACHED_OBJECTS = 256;
var DEFAULT_MAX_OBJECT_CACHE_BYTES = 16 * 1024 * 1024;
var DEFAULT_MAX_XREF_CACHE_BYTES = 16 * 1024 * 1024;
var latin14 = new TextDecoder("latin1");
var PdfObjectReader = class _PdfObjectReader {
  store;
  limits;
  #xref;
  #xrefSectionOffsets = /* @__PURE__ */ new Set();
  #cache = /* @__PURE__ */ new Map();
  #objectCacheBytes = 0;
  #peakObjectCacheBytes = 0;
  #root;
  #pagesRoot;
  #pageCount;
  #recoveryComplete = false;
  constructor(source, options) {
    this.store = new SparseByteStore(source, options);
    this.limits = {
      maxObjectBytes: options.maxObjectBytes ?? DEFAULT_MAX_OBJECT_BYTES,
      maxDecodedStreamBytes: options.maxDecodedStreamBytes ?? DEFAULT_MAX_DECODED_STREAM_BYTES,
      maxXrefBytes: options.maxXrefBytes ?? DEFAULT_MAX_XREF_BYTES,
      maxPageTreeDepth: options.maxPageTreeDepth ?? DEFAULT_MAX_PAGE_TREE_DEPTH,
      maxFormDepth: options.maxFormDepth ?? DEFAULT_MAX_FORM_DEPTH,
      maxCachedObjects: options.maxCachedObjects ?? DEFAULT_MAX_CACHED_OBJECTS,
      maxObjectCacheBytes: options.maxObjectCacheBytes ?? DEFAULT_MAX_OBJECT_CACHE_BYTES,
      maxXrefCacheBytes: options.maxXrefCacheBytes ?? DEFAULT_MAX_XREF_CACHE_BYTES
    };
    for (const [name, value] of Object.entries(this.limits)) {
      if (!Number.isSafeInteger(value) || value <= 0) {
        throw new RangeError(`${name} must be a positive safe integer`);
      }
    }
    this.#xref = new XrefIndex(this.limits.maxXrefCacheBytes);
  }
  static async open(source, options = {}) {
    const reader = new _PdfObjectReader(source, options);
    try {
      await reader.#initialize();
    } catch (error) {
      throw normalizePdfError(error);
    }
    return reader;
  }
  get stats() {
    return {
      ...this.store.stats,
      objectCacheBytes: this.#objectCacheBytes,
      peakObjectCacheBytes: this.#peakObjectCacheBytes,
      xrefEntries: this.#xref.size,
      xrefResidentBytes: this.#xref.residentBytes
    };
  }
  async pageCount() {
    await this.#loadPagesRoot();
    if (this.#pageCount === void 0) throw new Error("PDF page count was not initialized");
    return this.#pageCount;
  }
  async getPage(index) {
    await this.#loadPagesRoot();
    const pageCount = this.#pageCount;
    const pagesRoot = this.#pagesRoot;
    if (pageCount === void 0 || pagesRoot === void 0) {
      throw new Error("PDF page tree was not initialized");
    }
    if (!Number.isSafeInteger(index) || index < 0 || index >= pageCount) {
      throw new RangeError(`page index ${index} is outside 0..${pageCount - 1}`);
    }
    const result = await this.#findPage(pagesRoot, {}, index, 0);
    if (!result.page) throw new Error(`page tree ended before page index ${index}`);
    return result.page;
  }
  async #loadPagesRoot() {
    if (this.#pagesRoot) return;
    if (!this.#root) throw new Error("PDF trailer has no /Root reference");
    const catalog = await this.resolve(this.#root);
    if (!isDict(catalog)) throw new Error("PDF catalog is not a dictionary");
    const pagesRef = catalog.get("Pages");
    if (!isRef(pagesRef)) throw new Error("PDF catalog has no /Pages reference");
    const root = await this.getObject(pagesRef.object);
    if (!isDict(root)) throw new Error("PDF /Pages root is not a dictionary");
    this.#pagesRoot = pagesRef;
    this.#pageCount = numberValue(root.get("Count"), "/Pages /Count");
  }
  async resolve(value) {
    return isRef(value) ? this.getObject(value.object) : value;
  }
  async resolveDict(value) {
    if (value === void 0) return void 0;
    const resolved = await this.resolve(value);
    if (!isDict(resolved)) throw new Error("expected PDF dictionary");
    return resolved;
  }
  async getObject(objectNumber) {
    const cached = this.#cache.get(objectNumber);
    if (cached !== void 0) {
      this.#cache.delete(objectNumber);
      this.#cache.set(objectNumber, cached);
      return cached.value;
    }
    let entry = this.#xref.get(objectNumber);
    if (!entry) {
      await this.#recoverXref();
      entry = this.#xref.get(objectNumber);
    }
    if (!entry) throw new Error(`missing xref entry for object ${objectNumber}`);
    let value;
    try {
      value = entry.kind === "direct" ? await this.#readDirectObject(objectNumber, entry) : await this.#readCompressedObject(objectNumber, entry);
    } catch (error) {
      if (this.#recoveryComplete) throw error;
      await this.#recoverXref();
      const recovered = this.#xref.get(objectNumber);
      if (!recovered) throw error;
      value = recovered.kind === "direct" ? await this.#readDirectObject(objectNumber, recovered) : await this.#readCompressedObject(objectNumber, recovered);
    }
    const size = estimateObjectBytes(value);
    if (size <= this.limits.maxObjectCacheBytes) {
      while (this.#cache.size >= this.limits.maxCachedObjects || this.#objectCacheBytes + size > this.limits.maxObjectCacheBytes) {
        const oldest = this.#cache.keys().next().value;
        if (oldest === void 0) break;
        this.#deleteCached(oldest);
      }
      this.#cache.set(objectNumber, { value, size });
      this.#objectCacheBytes += size;
      this.#peakObjectCacheBytes = Math.max(this.#peakObjectCacheBytes, this.#objectCacheBytes);
    }
    return value;
  }
  releasePage() {
    this.#cache.clear();
    this.#objectCacheBytes = 0;
  }
  close() {
    this.#cache.clear();
    this.#objectCacheBytes = 0;
    this.#pagesRoot = void 0;
    this.#pageCount = void 0;
    this.#xref.clear();
    this.store.clear();
  }
  #deleteCached(objectNumber) {
    const cached = this.#cache.get(objectNumber);
    if (!cached) return;
    this.#cache.delete(objectNumber);
    this.#objectCacheBytes -= cached.size;
  }
  async decodeStream(stream) {
    let bytes = stream.bytes;
    const filterValue = stream.dict.get("Filter");
    const filters = Array.isArray(filterValue) ? filterValue : filterValue === void 0 ? [] : [filterValue];
    const decodeParameters = stream.dict.get("DecodeParms") ?? stream.dict.get("DP");
    const parameters = Array.isArray(decodeParameters) ? decodeParameters : filters.map(() => decodeParameters);
    for (const [index, filter] of filters.entries()) {
      if (!isName(filter)) throw new Error("unsupported indirect or malformed stream filter");
      const parameter = parameters[index];
      const dict = parameter === null || parameter === void 0 ? void 0 : parameter;
      if (dict !== void 0 && !isDict(dict)) {
        throw new Error("unsupported indirect or malformed stream decode parameters");
      }
      if (filter.value === "FlateDecode" || filter.value === "Fl") {
        bytes = await decodeFlate(bytes, dict, this.limits.maxDecodedStreamBytes);
      } else if (filter.value === "LZWDecode" || filter.value === "LZW") {
        bytes = decodeLzw(bytes, dict, this.limits.maxDecodedStreamBytes);
      } else if (filter.value === "ASCIIHexDecode" || filter.value === "AHx") {
        bytes = decodeAsciiHex(bytes, this.limits.maxDecodedStreamBytes);
      } else {
        throw new PdfError("UNSUPPORTED_FEATURE", `unsupported stream filter /${filter.value}`);
      }
    }
    return bytes;
  }
  async #initialize() {
    const headerLength = Math.min(this.store.source.size, 1024);
    const header = latin14.decode(await this.store.read(0, headerLength));
    if (!header.includes("%PDF-")) throw new Error("input does not contain a PDF header");
    const tailLength = Math.min(this.store.source.size, this.limits.maxXrefBytes);
    const tailOffset = this.store.source.size - tailLength;
    const tailBytes = await this.store.read(tailOffset, tailLength);
    const startXref = findStartXref(tailBytes);
    if (startXref === void 0) {
      await this.#recoverXref();
      return;
    }
    try {
      await this.#readXrefChain(startXref, /* @__PURE__ */ new Set());
    } catch (error) {
      if (error instanceof PdfError) throw error;
      await this.#recoverXref();
    }
  }
  async #recoverXref() {
    if (this.#recoveryComplete) return;
    this.#recoveryComplete = true;
    const length = Math.min(this.store.source.size, this.limits.maxXrefBytes);
    const offset = this.store.source.size - length;
    const recovered = scanPdfStructure(await this.store.read(offset, length), offset);
    for (const [object, entry] of recovered.objects) {
      this.#xref.set(object, { kind: "direct", ...entry });
    }
    if (recovered.root) this.#root = recovered.root;
    if (!this.#root) throw new Error("PDF recovery could not locate a /Root reference");
  }
  async #readXrefChain(offset, visited) {
    if (!Number.isSafeInteger(offset) || offset < 0 || offset >= this.store.source.size) {
      throw new Error(`invalid xref offset ${offset}`);
    }
    if (visited.has(offset)) throw new Error(`cyclic xref /Prev chain at ${offset}`);
    visited.add(offset);
    this.#xrefSectionOffsets.add(offset);
    const length = Math.min(this.limits.maxXrefBytes, this.store.source.size - offset);
    const bytes = await this.store.read(offset, length);
    const parser = new ValueParser(bytes);
    parser.skipSpace();
    const firstWord = parser.readWord();
    let trailer;
    if (firstWord === "xref") {
      trailer = this.#parseClassicXref(parser, offset);
    } else {
      const value = await this.#parseIndirectBytes(bytes, offset);
      if (!isStream(value) || !isName(value.dict.get("Type"), "XRef")) {
        throw new Error(`object at startxref ${offset} is not an xref stream`);
      }
      await this.#parseXrefStream(value);
      trailer = value.dict;
    }
    const root = trailer.get("Root");
    if (trailer.has("Encrypt")) {
      throw new PdfError("UNSUPPORTED_FEATURE", "encrypted PDFs are not supported");
    }
    if (!this.#root && isRef(root)) this.#root = root;
    const xrefStream = trailer.get("XRefStm");
    if (typeof xrefStream === "number") await this.#readXrefChain(xrefStream, visited);
    const previous = trailer.get("Prev");
    if (typeof previous === "number") await this.#readXrefChain(previous, visited);
  }
  #parseClassicXref(parser, absoluteOffset) {
    while (true) {
      parser.skipSpace();
      const markerOffset = parser.offset;
      const word = parser.readWord();
      if (word === "trailer") {
        const trailer = parser.parseValue();
        if (!isDict(trailer)) throw new Error("xref trailer is not a dictionary");
        return trailer;
      }
      parser.offset = markerOffset;
      const first = parser.parseNumber();
      const count = parser.parseNumber();
      if (!Number.isInteger(first) || !Number.isInteger(count) || count < 0) {
        throw new Error(`invalid xref subsection at ${absoluteOffset + markerOffset}`);
      }
      for (let index = 0; index < count; index += 1) {
        const entryOffset = parser.parseNumber();
        const generation = parser.parseNumber();
        const status2 = parser.readWord();
        if (status2 === "n" && !this.#xref.has(first + index)) {
          this.#xref.set(first + index, { kind: "direct", offset: entryOffset, generation });
        }
      }
    }
  }
  async #parseXrefStream(stream) {
    const widths = numberArray(stream.dict.get("W"), 3, "/W");
    const size = numberValue(stream.dict.get("Size"), "/Size");
    const indexes = stream.dict.has("Index") ? numberArray(stream.dict.get("Index"), void 0, "/Index") : [0, size];
    if (indexes.length % 2 !== 0) throw new Error("xref stream /Index must contain pairs");
    const bytes = await this.decodeStream(stream);
    let position = 0;
    for (let pair = 0; pair < indexes.length; pair += 2) {
      const first = indexes[pair];
      const count = indexes[pair + 1];
      if (first === void 0 || count === void 0) throw new Error("invalid xref /Index");
      for (let index = 0; index < count; index += 1) {
        const fields = widths.map((width) => {
          let value = 0;
          for (let byte = 0; byte < width; byte += 1)
            value = value * 256 + (bytes[position++] ?? 0);
          return value;
        });
        const type = widths[0] === 0 ? 1 : fields[0];
        const object = first + index;
        if (type === 1 && !this.#xref.has(object)) {
          this.#xref.set(object, {
            kind: "direct",
            offset: fields[1] ?? 0,
            generation: fields[2] ?? 0
          });
        } else if (type === 2 && !this.#xref.has(object)) {
          this.#xref.set(object, {
            kind: "compressed",
            streamObject: fields[1] ?? 0,
            index: fields[2] ?? 0
          });
        }
      }
    }
  }
  async #readDirectObject(objectNumber, entry) {
    const offsets = [...this.#xref.values()].filter(
      (candidate) => candidate.kind === "direct" && candidate.offset > entry.offset
    ).map((candidate) => candidate.offset);
    offsets.push(...[...this.#xrefSectionOffsets].filter((offset) => offset > entry.offset));
    const next = offsets.length > 0 ? Math.min(...offsets) : this.store.source.size;
    const length = Math.min(next - entry.offset, this.limits.maxObjectBytes);
    if (length <= 0) throw new Error(`invalid byte range for object ${objectNumber}`);
    const bytes = await this.store.read(entry.offset, length);
    return this.#parseIndirectBytes(bytes, entry.offset, objectNumber);
  }
  async #parseIndirectBytes(bytes, absoluteOffset, expectedObject) {
    const parser = new ValueParser(bytes);
    const object = parser.parseNumber();
    parser.parseNumber();
    if (parser.readWord() !== "obj")
      throw new Error(`invalid indirect object at ${absoluteOffset}`);
    if (expectedObject !== void 0 && object !== expectedObject) {
      throw new Error(`xref for object ${expectedObject} points to object ${object}`);
    }
    const value = parser.parseValue();
    if (!isDict(value)) return value;
    parser.skipSpace();
    const markerOffset = parser.offset;
    if (parser.readWord() !== "stream") {
      parser.offset = markerOffset;
      return value;
    }
    if (bytes[parser.offset] === 13) parser.offset += 1;
    if (bytes[parser.offset] === 10) parser.offset += 1;
    const declaredLength = value.get("Length");
    let length = typeof declaredLength === "number" ? declaredLength : void 0;
    if (length !== void 0 && !hasEndstreamMarker(bytes, parser.offset + length)) {
      length = void 0;
    }
    if (length === void 0) {
      length = findEndstreamLength(bytes, parser.offset);
      if (length === void 0) {
        throw new Error(`stream at ${absoluteOffset} has no resolvable /Length or endstream`);
      }
    }
    if (length > this.limits.maxObjectBytes || parser.offset + length > bytes.length) {
      throw new Error(`stream at ${absoluteOffset} exceeds the configured object limit`);
    }
    return {
      type: "stream",
      dict: value,
      bytes: bytes.slice(parser.offset, parser.offset + length)
    };
  }
  async #readCompressedObject(objectNumber, entry) {
    const container = await this.getObject(entry.streamObject);
    if (!isStream(container) || !isName(container.dict.get("Type"), "ObjStm")) {
      throw new Error(
        `object ${objectNumber} refers to invalid object stream ${entry.streamObject}`
      );
    }
    const decoded = await this.decodeStream(container);
    const count = numberValue(container.dict.get("N"), "/N");
    const first = numberValue(container.dict.get("First"), "/First");
    const header = new ValueParser(decoded);
    const entries = [];
    for (let index = 0; index < count; index += 1) {
      entries.push({ object: header.parseNumber(), offset: header.parseNumber() });
    }
    const indexed = entries[entry.index];
    const target = indexed?.object === objectNumber ? indexed : entries.find((candidate) => candidate.object === objectNumber);
    if (!target) {
      throw new Error(`object stream index mismatch for object ${objectNumber}`);
    }
    return new ValueParser(decoded, first + target.offset).parseValue();
  }
  async #findPage(ref, inherited, target, depth) {
    if (depth > this.limits.maxPageTreeDepth) throw new Error("page tree exceeds configured depth");
    const value = await this.getObject(ref.object);
    if (!isDict(value)) throw new Error(`page tree object ${ref.object} is not a dictionary`);
    const resources = await this.resolveDict(value.get("Resources")) ?? inherited.resources;
    const mediaBox = pdfBox(value.get("MediaBox")) ?? inherited.mediaBox;
    const cropBox = pdfBox(value.get("CropBox")) ?? inherited.cropBox;
    const rotateValue = value.get("Rotate");
    const rotate = typeof rotateValue === "number" ? rotateValue : inherited.rotate ?? 0;
    if (isName(value.get("Type"), "Page")) {
      const pageBox = cropBox ?? mediaBox;
      if (!pageBox) throw new Error(`page object ${ref.object} has no inherited /MediaBox`);
      return target === 0 ? { page: { ref, dict: value, resources, mediaBox: pageBox, rotate }, skipped: 0 } : { skipped: 1 };
    }
    const kids = value.get("Kids");
    if (!Array.isArray(kids)) throw new Error(`pages object ${ref.object} has no /Kids array`);
    let skipped = 0;
    for (const kid of kids) {
      if (!isRef(kid)) throw new Error(`pages object ${ref.object} has a non-reference kid`);
      const kidValue = await this.getObject(kid.object);
      if (!isDict(kidValue)) throw new Error(`page-tree kid ${kid.object} is not a dictionary`);
      const countValue = isName(kidValue.get("Type"), "Page") ? 1 : kidValue.get("Count");
      const count = typeof countValue === "number" ? countValue : 1;
      if (target >= skipped + count) {
        skipped += count;
        continue;
      }
      const result = await this.#findPage(
        kid,
        { resources, mediaBox, cropBox, rotate },
        target - skipped,
        depth + 1
      );
      if (result.page) return result;
      skipped += result.skipped;
    }
    return { skipped };
  }
};
function hasEndstreamMarker(bytes, offset) {
  if (offset < 0 || offset > bytes.length) return false;
  let position = offset;
  if (bytes[position] === 13) position += 1;
  if (bytes[position] === 10) position += 1;
  return latin14.decode(bytes.subarray(position, position + 9)) === "endstream";
}
function findEndstreamLength(bytes, streamOffset) {
  const end = latin14.decode(bytes.subarray(streamOffset)).indexOf("endstream");
  if (end < 0) return void 0;
  let length = end;
  if (length > 0 && bytes[streamOffset + length - 1] === 10) length -= 1;
  if (length > 0 && bytes[streamOffset + length - 1] === 13) length -= 1;
  return length;
}
function numberValue(value, label) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value;
}
function numberArray(value, length, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "number")) {
    throw new Error(`${label} must be a numeric array`);
  }
  if (length !== void 0 && value.length !== length)
    throw new Error(`${label} must contain ${length} numbers`);
  return value;
}
function pdfBox(value) {
  if (!Array.isArray(value) || value.length !== 4 || value.some((item) => typeof item !== "number"))
    return void 0;
  return value;
}
function estimateObjectBytes(value, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value === "boolean" || typeof value === "number") return 8;
  if (typeof value === "string") return value.length * 2;
  if (typeof value !== "object") return 0;
  if (seen.has(value)) return 0;
  seen.add(value);
  if (Array.isArray(value)) {
    return 16 + value.reduce((total, item) => total + estimateObjectBytes(item, seen), 0);
  }
  if (value instanceof Map) {
    let total = 32;
    for (const [key, item] of value) total += key.length * 2 + estimateObjectBytes(item, seen);
    return total;
  }
  if ("type" in value && value.type === "stream") {
    return value.bytes.byteLength + estimateObjectBytes(value.dict, seen);
  }
  if ("type" in value && value.type === "string") return value.bytes.byteLength + 16;
  if ("type" in value && value.type === "name") return value.value.length * 2 + 16;
  return 24;
}
var StreamingPdfReader = class _StreamingPdfReader {
  #objects;
  constructor(objects) {
    this.#objects = objects;
  }
  static async open(source, options = {}) {
    return new _StreamingPdfReader(await PdfObjectReader.open(source, options));
  }
  get stats() {
    return this.#objects.stats;
  }
  async getPageCount() {
    try {
      return await this.#objects.pageCount();
    } catch (error) {
      throw normalizePdfError(error);
    }
  }
  async getPage(index) {
    try {
      const page = await this.#objects.getPage(index);
      const [x1, y1, x2, y2] = page.mediaBox;
      const fonts = [];
      const visualSpans = [];
      const spans = await extractPageText(this.#objects, page, fonts, visualSpans);
      const { fills, paths, images } = await extractPageGraphics(this.#objects, page);
      for (const span of spans) span.source.page = index + 1;
      for (const span of visualSpans) span.source.page = index + 1;
      return {
        number: index + 1,
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        rotate: normalizeRotation(page.rotate),
        spans,
        ...visualSpans.length > 0 ? { visualSpans } : {},
        ...fonts.length > 0 ? { fonts } : {},
        ...fills.length > 0 ? { fills } : {},
        ...paths.length > 0 ? { paths } : {},
        ...images.length > 0 ? { images } : {}
      };
    } catch (error) {
      throw normalizePdfError(error);
    }
  }
  async *pages() {
    const count = await this.getPageCount();
    for (let index = 0; index < count; index += 1) {
      yield await this.getPage(index);
      this.releasePage();
    }
  }
  releasePage() {
    this.#objects.releasePage();
  }
  close() {
    this.#objects.close();
  }
};
async function openPdf(source, options = {}) {
  return StreamingPdfReader.open(source, options);
}
function normalizeRotation(value) {
  const normalized = (value % 360 + 360) % 360;
  if (normalized === 0 || normalized === 90 || normalized === 180 || normalized === 270)
    return normalized;
  return 0;
}

// ../streaming-pdf-reader/src/structure/semantic.ts
function inferSemanticBlocks(lines, tables) {
  const tableForLine = /* @__PURE__ */ new Map();
  for (const table of tables) {
    const tableSpans = new Set(table.cells.flatMap((cell) => cell.spans));
    for (const line of lines) {
      if (line.spans.some((span) => tableSpans.has(span))) tableForLine.set(line, table);
    }
  }
  const fontSizes = lines.flatMap((line) => line.spans.map((span) => span.fontSize)).filter((size) => Number.isFinite(size) && size > 0).sort((left, right) => left - right);
  const bodySize = dominantFontSize(fontSizes) ?? 12;
  const largestSize = fontSizes.at(-1) ?? bodySize;
  const blocks = [];
  const emittedTables = /* @__PURE__ */ new Set();
  const documentSpans = lines.flatMap((line) => line.spans);
  const documentIsProportional = documentSpans.filter(isMonospaced).length < documentSpans.length * 0.5;
  const hangingEdges = inferHangingEdges(lines);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) continue;
    const preformatted = documentIsProportional ? preformattedRun(lines, index) : void 0;
    if (preformatted) {
      blocks.push({
        type: "preformatted",
        text: preformattedText(preformatted.lines),
        lines: preformatted.lines
      });
      index = preformatted.end - 1;
      continue;
    }
    const table = tableForLine.get(line);
    if (table) {
      if (!emittedTables.has(table)) {
        const tableLines = lines.filter((item) => tableForLine.get(item) === table);
        const definitions2 = tableDefinitions(table);
        blocks.push(
          definitions2 ? { type: "definitionList", entries: definitions2, lines: tableLines } : { type: "table", table, lines: tableLines }
        );
        emittedTables.add(table);
      }
      continue;
    }
    const definitions = definitionRun(lines, index, tableForLine);
    if (definitions) {
      blocks.push({
        type: "definitionList",
        entries: definitions.entries,
        lines: lines.slice(index, definitions.end)
      });
      index = definitions.end - 1;
      continue;
    }
    const cards = cardRun(lines, index, tableForLine);
    if (cards) {
      blocks.push({
        type: "cardList",
        items: cards.items,
        lines: lines.slice(index, cards.end)
      });
      index = cards.end - 1;
      continue;
    }
    const sections = sectionGroup(lines, index, tableForLine);
    if (sections) {
      blocks.push({
        type: "sectionGroup",
        items: sections.items,
        lines: lines.slice(index, sections.end)
      });
      index = sections.end - 1;
      continue;
    }
    const employment = employmentEntry(lines, index, tableForLine);
    if (employment) {
      blocks.push({
        type: "employment",
        role: employment.role,
        organization: employment.organization,
        date: employment.date,
        lines: lines.slice(index, employment.end)
      });
      index = employment.end - 1;
      continue;
    }
    const headingLevel = inferHeadingLevel(line, bodySize, largestSize);
    if (headingLevel) {
      blocks.push({ type: "heading", level: headingLevel, text: line.text, lines: [line] });
      continue;
    }
    const list = listMarker(line.text);
    if (list) {
      const items = [];
      let cursor = index;
      while (cursor < lines.length) {
        const itemLine = lines[cursor];
        if (!itemLine || tableForLine.has(itemLine)) break;
        const marker = listMarker(itemLine.text);
        if (!marker || marker.ordered !== list.ordered) break;
        const itemLines = [itemLine];
        let text2 = marker.text;
        while (cursor + 1 < lines.length && isContinuation(itemLines.at(-1), lines[cursor + 1])) {
          const continuation = lines[cursor + 1];
          if (!continuation || listMarker(continuation.text) || tableForLine.has(continuation))
            break;
          if (endsSentence(itemLines.at(-1)) && startsEmphasizedLead(continuation)) break;
          cursor += 1;
          itemLines.push(continuation);
          text2 = joinText(text2, continuation.text);
        }
        items.push({ text: text2, lines: itemLines });
        cursor += 1;
      }
      blocks.push({ type: "list", ordered: list.ordered, items });
      index = cursor - 1;
      continue;
    }
    const paragraphLines = [line];
    let text = line.text;
    while (index + 1 < lines.length) {
      const next = lines[index + 1];
      if (!next || tableForLine.has(next) || listMarker(next.text)) break;
      if (inferHeadingLevel(next, bodySize, largestSize) || endsSentence(paragraphLines.at(-1)) && startsEmphasizedLead(next) || startsNextHangingItem(paragraphLines, next, hangingEdges) || !isContinuation(paragraphLines.at(-1), next))
        break;
      paragraphLines.push(next);
      text = joinText(text, next.text);
      index += 1;
    }
    blocks.push({ type: "paragraph", text, lines: paragraphLines });
  }
  return blocks;
}
function endsSentence(line) {
  return /[.!?][”')]?$/u.test(line?.text.trim() ?? "");
}
function startsEmphasizedLead(line) {
  const meaningful = line.spans.filter((span) => /\S/u.test(span.text));
  const first = meaningful[0];
  if (!first || !isBold(first)) return false;
  return meaningful.some((span) => !isBold(span));
}
function isBold(span) {
  return /(?:bold|semibold|demi|medium|medi)/i.test(span.fontFamily ?? "");
}
function startsNextHangingItem(paragraph, next, hangingEdges) {
  const first = paragraph[0];
  const previous = paragraph.at(-1);
  if (!first || !previous) return false;
  const scale = Math.max(first.bounds.height, previous.bounds.height, next.bounds.height);
  const hangingIndent = previous.bounds.x - first.bounds.x;
  const returnsToOuterEdge = Math.abs(next.bounds.x - first.bounds.x) <= Math.max(3, scale * 0.3);
  const knownOuterEdge = hangingEdges.find(
    (edge) => Math.abs(first.bounds.x - edge.x) <= 3 && Math.abs(next.bounds.x - edge.x) <= 3
  );
  const baselineStep = Math.abs(previous.bounds.y - next.bounds.y);
  const separatedSingleton = paragraph.length === 1 && knownOuterEdge !== void 0 && baselineStep >= knownOuterEdge.continuationStep * 1.15;
  return returnsToOuterEdge && (separatedSingleton || paragraph.length >= 2 && hangingIndent >= Math.max(4, scale * 0.35));
}
function inferHangingEdges(lines) {
  const edges = [];
  for (let index = 0; index + 2 < lines.length; index += 1) {
    const outer = lines[index];
    const indented = lines[index + 1];
    if (!outer || !indented) continue;
    const scale = Math.max(outer.bounds.height, indented.bounds.height);
    if (indented.bounds.x - outer.bounds.x < Math.max(4, scale * 0.35)) continue;
    const returns = lines.slice(index + 2, index + 7).some((line) => Math.abs(line.bounds.x - outer.bounds.x) <= Math.max(3, scale * 0.3));
    if (returns && !edges.some((edge) => Math.abs(edge.x - outer.bounds.x) <= 3)) {
      edges.push({
        x: outer.bounds.x,
        continuationStep: Math.abs(outer.bounds.y - indented.bounds.y)
      });
    }
  }
  return edges;
}
function preformattedRun(lines, start) {
  const run2 = [];
  let cursor = start;
  while (cursor < lines.length) {
    const line = lines[cursor];
    if (!line || monospacedRatio(line) < 0.8) break;
    const previous = run2.at(-1);
    if (previous) {
      const gap = previous.bounds.y - (line.bounds.y + line.bounds.height);
      if (gap < -3 || gap > Math.max(previous.bounds.height, line.bounds.height) * 1.5) break;
    }
    run2.push(line);
    cursor += 1;
  }
  return run2.length >= 2 ? { lines: run2, end: cursor } : void 0;
}
function monospacedRatio(line) {
  return line.spans.length === 0 ? 0 : line.spans.filter(isMonospaced).length / line.spans.length;
}
function isMonospaced(span) {
  return /(?:courier|mono|typewriter|cmtt)/i.test(span.fontFamily ?? "");
}
function preformattedText(lines) {
  const spans = lines.flatMap((line) => line.spans).filter(isMonospaced);
  const widths = spans.map((span) => span.bounds.width / Math.max(1, [...span.text].length)).filter((width) => Number.isFinite(width) && width > 0).sort((left, right) => left - right);
  const characterWidth = widths[Math.floor(widths.length / 2)] ?? 1;
  const origin = Math.min(...spans.map((span) => span.bounds.x));
  return lines.map((line) => {
    let output = "";
    for (const span of [...line.spans].sort((left, right) => left.bounds.x - right.bounds.x)) {
      const column = Math.max(0, Math.round((span.bounds.x - origin) / characterWidth));
      if (output.length < column) output += " ".repeat(column - output.length);
      output += span.text;
    }
    return output.trimEnd();
  }).join("\n");
}
function tableDefinitions(table) {
  const rowCount = Math.max(0, ...table.cells.map((cell) => cell.row + 1));
  const rows = Array.from({ length: rowCount }, () => ["", ""]);
  for (const cell of table.cells) {
    if (cell.column > 1) return void 0;
    const row = rows[cell.row];
    if (row) row[cell.column] = cell.text;
  }
  if (rows.length < 2 || !table.cells.some(
    (cell) => cell.spans.some((span) => /(?:bold|semibold|demi)/i.test(span.fontFamily ?? ""))
  ) || !rows.every(
    ([term, description]) => Boolean(term) && /\p{L}/u.test(term ?? "") && /^(?:\p{Sc}\s*)?[\d.,'’\s]+(?:\s*%)?$/u.test(description ?? "")
  )) {
    return void 0;
  }
  return rows.map(([term, description]) => ({ term: term ?? "", description: description ?? "" }));
}
function dominantFontSize(sizes) {
  const counts = /* @__PURE__ */ new Map();
  for (const size of sizes) {
    const bucket = Math.round(size * 2) / 2;
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  return [...counts].sort(
    ([leftSize, leftCount], [rightSize, rightCount]) => rightCount - leftCount || leftSize - rightSize
  )[0]?.[0];
}
function cardRun(lines, start, tableForLine) {
  const items = [];
  let cursor = start;
  while (cursor + 2 < lines.length) {
    const title = lines[cursor];
    const subtitle = lines[cursor + 1];
    const trailing = lines[cursor + 2];
    if (!title || !subtitle || !trailing) break;
    if (tableForLine.has(title) || tableForLine.has(subtitle) || tableForLine.has(trailing)) break;
    const sharedLeft = Math.abs(title.bounds.x - subtitle.bounds.x) <= 12;
    const trailingOnTitle = trailing.bounds.x > title.bounds.x + 120 && Math.abs(trailing.bounds.y - title.bounds.y) <= 3;
    if (!sharedLeft || !trailingOnTitle) break;
    items.push({ title: title.text, details: [subtitle.text, trailing.text] });
    cursor += 3;
  }
  return items.length >= 2 ? { items, end: cursor } : void 0;
}
function sectionGroup(lines, start, tableForLine) {
  const items = [];
  let cursor = start;
  while (cursor < lines.length) {
    const label = lines[cursor];
    if (!label || tableForLine.has(label) || !/^[A-Z][A-Z\s/-]{2,24}$/.test(label.text.trim()))
      break;
    const content = [];
    cursor += 1;
    while (cursor < lines.length) {
      const value = lines[cursor];
      if (!value || tableForLine.has(value) || Math.abs(value.bounds.x - label.bounds.x) > 15)
        break;
      content.push(value.text);
      cursor += 1;
    }
    if (content.length === 0) break;
    items.push({ label: label.text.trim(), content });
  }
  return items.length >= 2 ? { items, end: cursor } : void 0;
}
function employmentEntry(lines, start, tableForLine) {
  const title = lines[start];
  const organization = lines[start + 1];
  const date = lines[start + 2];
  if (!title || !organization || !date) return void 0;
  if (tableForLine.has(title) || tableForLine.has(organization) || tableForLine.has(date)) {
    return void 0;
  }
  const titleEmphasized = title.spans.some(
    (span) => /(?:bold|semibold|demi)/i.test(span.fontFamily ?? "")
  );
  const looksLikeDate = /\b(?:19|20)\d{2}\b/.test(date.text);
  const organizationBelow = Math.abs(title.bounds.x - organization.bounds.x) <= 12;
  const dateBesideTitle = date.bounds.x > title.bounds.x + title.bounds.width && Math.abs(date.bounds.y - title.bounds.y) <= Math.max(title.bounds.height, date.bounds.height);
  return titleEmphasized && looksLikeDate && organizationBelow && dateBesideTitle ? {
    role: title.text,
    organization: organization.text,
    date: date.text,
    end: start + 3
  } : void 0;
}
function definitionRun(lines, start, tableForLine) {
  const entries = [];
  let cursor = start;
  while (cursor + 1 < lines.length) {
    const term = lines[cursor];
    const value = lines[cursor + 1];
    if (!term || !value || tableForLine.has(term) || tableForLine.has(value)) break;
    const text = term.text.trim();
    const aligned = Math.abs(term.bounds.x - value.bounds.x) <= 20;
    if (!aligned || !/^[A-Z][A-Z\s/-]*$/.test(text) || text.length > 24) break;
    entries.push({ term: text, description: value.text });
    cursor += 2;
  }
  if (entries.length >= 2) {
    while (cursor < lines.length) {
      const continuation = lines[cursor];
      const previous = lines[cursor - 1];
      if (!continuation || tableForLine.has(continuation) || /^[A-Z][A-Z\s/-]*$/.test(continuation.text.trim()) || !isContinuation(previous, continuation)) {
        break;
      }
      const last = entries.at(-1);
      if (!last) break;
      last.description = joinText(last.description, continuation.text);
      cursor += 1;
    }
  }
  return entries.length >= 2 ? { entries, end: cursor } : void 0;
}
function inferHeadingLevel(line, bodySize, largestSize) {
  const text = line.text.trim();
  if (!text || text.length > 100) return void 0;
  const size = Math.max(...line.spans.map((span) => span.fontSize));
  const emphasized = line.spans.some(
    (span) => /(?:bold|semibold|demi|medi)/i.test(span.fontFamily ?? "")
  );
  if (size >= largestSize * 0.94 && size >= bodySize * 1.35) return 1;
  if (/^\d+(?:\.\d+)*\.?(?:\s+|$)/.test(text) && /[A-Za-z]/.test(text) && text.split(/\s+/).length <= 6)
    return size >= bodySize * 1.35 ? 3 : 4;
  const ratio = size / bodySize;
  if (ratio >= 1.7) return 1;
  if (ratio >= 1.5) return 2;
  if (ratio >= 1.35) return 3;
  if (ratio >= 1.15 || emphasized && ratio >= 1.08) return 4;
  return void 0;
}
function listMarker(text) {
  const unordered = /^\s*[•●▪◦]\s*(.+)$/u.exec(text);
  if (unordered?.[1]) return { ordered: false, text: unordered[1] };
  const ordered = /^\s*\d+[.)]\s+(.+)$/u.exec(text);
  return ordered?.[1] ? { ordered: true, text: ordered[1] } : void 0;
}
function isContinuation(previous, next) {
  if (!previous || !next) return false;
  const verticalGap = previous.bounds.y - (next.bounds.y + next.bounds.height);
  const sameFlow = Math.abs(previous.bounds.x - next.bounds.x) <= Math.max(18, previous.bounds.height * 1.5);
  return verticalGap >= -3 && verticalGap <= Math.max(12, previous.bounds.height * 1.2) && sameFlow;
}
function joinText(previous, next) {
  if (/[-‐‑]$/u.test(previous)) return `${previous.slice(0, -1)}${next.trimStart()}`;
  if (/\S{20,}$/u.test(previous) && /^[a-z]{1,4}[.,;:]?$/u.test(next.trim())) {
    return `${previous}${next.trim()}`;
  }
  return `${previous.trimEnd()} ${next.trimStart()}`;
}

// ../streaming-pdf-reader/src/structure/index.ts
function structurePage(page, options = {}) {
  const lineTolerance = options.lineTolerance ?? 2;
  const lines = groupLines(page.spans, lineTolerance);
  const tables = inferTables(page.number, lines, options);
  return {
    page: page.number,
    lines,
    tables,
    blocks: inferSemanticBlocks(lines, tables)
  };
}
function tableToRows(table) {
  const rowCount = Math.max(0, ...table.cells.map((cell) => cell.row + cell.rowSpan));
  const columnCount = Math.max(0, ...table.cells.map((cell) => cell.column + cell.columnSpan));
  const rows = Array.from(
    { length: rowCount },
    () => Array.from({ length: columnCount }, () => "")
  );
  for (const cell of table.cells) {
    const row = rows[cell.row];
    if (row) row[cell.column] = cell.text;
  }
  return rows;
}
function tableToHtml(table) {
  const rows = tableToRows(table);
  const header = tableHasHeader(table);
  return `<table>${rows.map((row, index) => {
    const cell = header && index === 0 ? "th" : "td";
    return `<tr>${row.map((value) => `<${cell}>${escapeHtml(value)}</${cell}>`).join("")}</tr>`;
  }).join("")}</table>`;
}
function tableHasHeader(table) {
  const rows = tableToRows(table);
  const first = rows[0] ?? [];
  const rest = rows.slice(1).flat();
  return first.length > 0 && first.every((value) => /\p{L}/u.test(value) && !isNumericField(value)) && rest.some(isNumericField);
}
function isNumericField(value) {
  return /^(?:\p{Sc}\s*)?[\d.,'’\s]+(?:\s*%)?$/u.test(value.trim());
}
function groupLines(spans, tolerance) {
  const horizontal = groupHorizontalLines(
    spans.filter((span) => span.direction !== "ttb"),
    tolerance
  );
  const vertical = groupVerticalLines(
    spans.filter((span) => span.direction === "ttb"),
    tolerance
  );
  return [...horizontal, ...vertical];
}
function groupHorizontalLines(spans, tolerance) {
  const rows = [];
  for (const span of spans) {
    const row = rows.at(-1);
    const previous = row?.at(-1);
    const sameBaseline = Math.abs((row?.[0]?.bounds.y ?? Number.NaN) - span.bounds.y) <= tolerance;
    const continuesForward = !previous || span.bounds.x >= previous.bounds.x - Math.max(tolerance, previous.fontSize * 0.25);
    if (row && sameBaseline && continuesForward) row.push(span);
    else rows.push([span]);
  }
  attachSuperscriptRows(rows, tolerance);
  return rows.map((row) => {
    row.sort((left, right) => left.bounds.x - right.bounds.x);
    return {
      type: "line",
      bounds: union(row.map((span) => span.bounds)),
      text: joinSpans(row),
      spans: row,
      confidence: 1,
      reasons: ["shared-baseline"]
    };
  });
}
function attachSuperscriptRows(rows, tolerance) {
  for (let index = 1; index < rows.length; index += 1) {
    const base = rows[index - 1];
    const superscript = rows[index];
    if (!base || !superscript || !isAttachedSuperscript(base, superscript, tolerance)) continue;
    base.push(...superscript);
    rows.splice(index, 1);
    const continuation = rows[index];
    if (continuation && continuesSuperscriptLine(base, continuation, tolerance)) {
      base.push(...continuation);
      rows.splice(index, 1);
    }
    index -= 1;
  }
}
function isAttachedSuperscript(base, superscript, tolerance) {
  const baseBounds = union(base.map((span) => span.bounds));
  const superscriptBounds = union(superscript.map((span) => span.bounds));
  const sourceIsSmaller = superscriptBounds.height <= baseBounds.height * 0.85;
  const center = superscriptBounds.y + superscriptBounds.height / 2;
  const verticallyAttached = center >= baseBounds.y - tolerance && center <= baseBounds.y + baseBounds.height + tolerance;
  const gap = superscriptBounds.x - baseBounds.x - baseBounds.width;
  return sourceIsSmaller && verticallyAttached && gap >= -tolerance && gap <= baseBounds.height * 1.5;
}
function continuesSuperscriptLine(base, continuation, tolerance) {
  const regularBase = base.filter(
    (span) => span.bounds.height >= Math.max(...base.map((item) => item.bounds.height)) * 0.85
  );
  const baseBounds = union(base.map((span) => span.bounds));
  const regularBounds = union(regularBase.map((span) => span.bounds));
  const continuationBounds = union(continuation.map((span) => span.bounds));
  const sameBaseline = Math.abs(regularBounds.y - continuationBounds.y) <= tolerance;
  const gap = continuationBounds.x - baseBounds.x - baseBounds.width;
  return sameBaseline && gap >= -tolerance && gap <= Math.max(18, regularBounds.height * 1.5);
}
function groupVerticalLines(spans, tolerance) {
  const columns = [];
  for (const span of [...spans].sort(
    (left, right) => right.bounds.x - left.bounds.x || right.bounds.y - left.bounds.y
  )) {
    const column = columns.find(
      (candidate) => Math.abs((candidate[0]?.bounds.x ?? 0) - span.bounds.x) <= tolerance
    );
    if (column) column.push(span);
    else columns.push([span]);
  }
  return columns.map((column) => {
    column.sort((left, right) => right.bounds.y - left.bounds.y);
    return {
      type: "line",
      bounds: union(column.map((span) => span.bounds)),
      text: column.map((span) => span.text).join(""),
      spans: column,
      confidence: 1,
      reasons: ["shared-vertical-axis"]
    };
  });
}
function inferTables(page, lines, options) {
  const minimumRows = options.minimumTableRows ?? 2;
  const minimumColumns = options.minimumTableColumns ?? 2;
  const columnTolerance = options.columnTolerance ?? 16;
  const rowCandidates = lines.map((line) => ({ line, cells: splitCells(line) }));
  const runs = [];
  let run2 = [];
  for (const candidate of rowCandidates) {
    const first = run2[0];
    const compatible = !first || compatibleRows(first, candidate, columnTolerance);
    if (candidate.cells.length >= minimumColumns && compatible) run2.push(candidate);
    else {
      if (run2.length >= minimumRows) runs.push(run2);
      run2 = candidate.cells.length >= minimumColumns ? [candidate] : [];
    }
  }
  if (run2.length >= minimumRows) runs.push(run2);
  const tables = runs.map((rows) => {
    const repeatedColumns = repeatedColumnStarts(rows, columnTolerance);
    const refinedRows = repeatedColumns.length > (rows[0]?.cells.length ?? 0) ? rows.map((candidate) => ({
      line: candidate.line,
      cells: cellsAtColumns(candidate.line, repeatedColumns)
    })) : rows;
    const columns = repeatedColumns.length > (rows[0]?.cells.length ?? 0) ? repeatedColumns : (rows[0]?.cells ?? []).map((cell) => cell.bounds.x);
    const cells = refinedRows.flatMap(
      (candidate, row) => candidate.cells.map((cell, column) => ({
        row,
        column,
        rowSpan: 1,
        columnSpan: 1,
        bounds: cell.bounds,
        text: joinSpans(cell.spans),
        spans: cell.spans,
        confidence: 0.9,
        reasons: ["repeated-column-alignment"]
      }))
    );
    return {
      type: "table",
      page,
      bounds: union(cells.map((cell) => cell.bounds)),
      columns,
      cells,
      confidence: 0.9,
      reasons: ["consecutive-rows", "repeated-column-alignment"]
    };
  });
  attachWrappedTableCells(tables, lines, columnTolerance);
  return tables;
}
function attachWrappedTableCells(tables, lines, tolerance) {
  const assigned = new Set(tables.flatMap((table) => table.cells.flatMap((cell) => cell.spans)));
  for (const table of tables) {
    const rowHeight = median(table.cells.map((cell) => cell.bounds.height));
    for (const line of lines) {
      if (line.spans.some((span) => assigned.has(span))) continue;
      const gap = table.bounds.y - (line.bounds.y + line.bounds.height);
      if (gap < -2 || gap > Math.max(4, rowHeight * 0.6)) continue;
      const column = table.columns.findIndex(
        (x, index) => index > 0 && Math.abs(line.bounds.x - x) <= tolerance * 0.35
      );
      if (column < 1) continue;
      const lastRow = Math.max(...table.cells.map((cell2) => cell2.row));
      const cell = table.cells.find(
        (candidate) => candidate.row === lastRow && candidate.column === column
      );
      if (!cell) continue;
      cell.text = `${cell.text} ${line.text}`;
      cell.spans.push(...line.spans);
      cell.bounds = union([cell.bounds, line.bounds]);
      table.bounds = union([table.bounds, line.bounds]);
      for (const span of line.spans) assigned.add(span);
    }
  }
}
function median(values) {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.floor(ordered.length / 2)] ?? 0;
}
function repeatedColumnStarts(rows, tolerance) {
  const candidates = [];
  for (const [row, candidate] of rows.entries()) {
    for (const [index, span] of candidate.line.spans.entries()) {
      const previous = candidate.line.spans[index - 1];
      if (previous && !shouldInsertSpace(previous, span)) continue;
      const match = candidates.find((item) => Math.abs(item.x - span.bounds.x) <= tolerance * 0.2);
      if (match) match.rows.add(row);
      else candidates.push({ x: span.bounds.x, rows: /* @__PURE__ */ new Set([row]) });
    }
  }
  const minimumSupport = Math.max(2, Math.ceil(rows.length * 0.6));
  return candidates.filter((candidate) => candidate.rows.size >= minimumSupport).map((candidate) => candidate.x).sort((left, right) => left - right);
}
function cellsAtColumns(line, columns) {
  const cells = columns.map(() => []);
  for (const span of line.spans) {
    let column = 0;
    for (let index = 1; index < columns.length; index += 1) {
      if (span.bounds.x >= ((columns[index - 1] ?? 0) + (columns[index] ?? 0)) / 2) column = index;
    }
    cells[column]?.push(span);
  }
  return cells.filter((spans) => spans.length > 0).map((spans) => ({ bounds: union(spans.map((span) => span.bounds)), spans }));
}
function splitCells(line) {
  const cells = [];
  for (const span of line.spans) {
    const current = cells.at(-1);
    const previous = current?.at(-1);
    const gap = previous ? span.bounds.x - previous.bounds.x - previous.bounds.width : 0;
    if (current && previous && gap <= Math.max(18, span.fontSize * 2)) current.push(span);
    else cells.push([span]);
  }
  return cells.map((spans) => ({ bounds: union(spans.map((span) => span.bounds)), spans }));
}
function compatibleRows(first, next, tolerance) {
  return first.cells.length === next.cells.length && first.cells.every((cell, index) => {
    const other = next.cells[index]?.bounds;
    if (!other) return false;
    const leftAligned = Math.abs(cell.bounds.x - other.x) <= tolerance;
    const rightAligned = Math.abs(cell.bounds.x + cell.bounds.width - other.x - other.width) <= tolerance;
    return leftAligned || rightAligned;
  });
}
function joinSpans(spans) {
  let output = "";
  let previous;
  for (const span of spans) {
    if (previous && shouldInsertSpace(previous, span)) output += " ";
    output += span.text;
    previous = span;
  }
  return output.trim();
}
function shouldInsertSpace(previous, current) {
  if (/\s$/u.test(previous.text) || /^\s/u.test(current.text)) return false;
  if (current.hasLeadingSpace) return true;
  const gap = current.bounds.x - (previous.bounds.x + previous.bounds.width);
  if (/^[.!?]$/u.test(previous.text) && /^\p{Lu}/u.test(current.text)) {
    return gap > current.fontSize * 0.18;
  }
  if (/\p{L}[.!?]$/u.test(previous.text) && /^\p{Lu}/u.test(current.text)) {
    return gap > -current.fontSize * 0.1;
  }
  const continuation = /[-‐‑‒–—([{/]$/u.test(previous.text);
  const closingPunctuation = /^[,.;:!?%)\]}]/u.test(current.text);
  if (continuation || closingPunctuation) return false;
  if (gap > current.fontSize) return true;
  const tokenBoundary = [...previous.text].length > 1 || [...current.text].length > 1 || /\p{L}$/u.test(previous.text) && /^\p{L}/u.test(current.text);
  return gap > current.fontSize * 0.18 && tokenBoundary;
}
function union(rectangles) {
  if (rectangles.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const left = Math.min(...rectangles.map((rect) => rect.x));
  const bottom = Math.min(...rectangles.map((rect) => rect.y));
  const right = Math.max(...rectangles.map((rect) => rect.x + rect.width));
  const top = Math.max(...rectangles.map((rect) => rect.y + rect.height));
  return { x: left, y: bottom, width: right - left, height: top - bottom };
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ../streaming-pdf-reader/packages/html-writer/dist/index.js
function dominantTextColor(lines) {
  const counts = /* @__PURE__ */ new Map();
  for (const span of lines.flatMap((line) => line.spans)) {
    const color = normalizedColor(span.color) ?? "#000000";
    counts.set(color, (counts.get(color) ?? 0) + Math.max(1, [...span.text].length));
  }
  return [...counts].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "#000000";
}
function semanticTextHtml(text, lines, defaultColor, preserveWeight = true) {
  const ranges = [];
  let cursor = 0;
  for (const span of lines.flatMap((line) => line.spans)) {
    if (!span.text) continue;
    const start = text.indexOf(span.text, cursor);
    if (start < 0) continue;
    cursor = start + span.text.length;
    const color = normalizedColor(span.color);
    const bold = preserveWeight && /(?:bold|semibold|demi|medium|medi)/i.test(span.fontFamily ?? "");
    const italic = /(?:italic|oblique|slanted|slant|ital)/i.test(span.fontFamily ?? "");
    const nondefaultColor = color && color !== defaultColor ? color : void 0;
    if (nondefaultColor || bold || italic) {
      ranges.push({
        start,
        end: cursor,
        ...nondefaultColor ? { color: nondefaultColor } : {},
        bold,
        italic
      });
    }
  }
  const merged = mergeRanges(ranges, text);
  let html = "";
  let offset = 0;
  for (const range of merged) {
    html += escapeHtml2(text.slice(offset, range.start));
    html += styledHtml(text.slice(range.start, range.end), range);
    offset = range.end;
  }
  return html + escapeHtml2(text.slice(offset));
}
function mergeRanges(ranges, text) {
  const merged = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && previous.color === range.color && previous.bold === range.bold && previous.italic === range.italic && /^\s*$/.test(text.slice(previous.end, range.start))) {
      previous.end = range.end;
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}
function styledHtml(value, range) {
  let html = escapeHtml2(value);
  if (range.color) html = `<span style="color:${range.color}">${html}</span>`;
  if (range.italic) html = `<em>${html}</em>`;
  if (range.bold) html = `<strong>${html}</strong>`;
  return html;
}
function normalizedColor(value) {
  if (!value || !/^#[\da-f]{6}$/i.test(value)) return void 0;
  const color = value.toLowerCase();
  return color === "#000000" || color === "#000" ? "#000000" : color;
}
function escapeHtml2(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function visualFontAliases(pageNumber, fonts) {
  return new Map(
    fonts.filter((font) => font.format === "truetype" && !/(?:courier|^TTE)/i.test(font.family ?? "")).map((font) => [font.id, `boxpdf-${pageNumber}-${font.id}`])
  );
}
function visualFontFace(font, aliases) {
  if (font.format !== "truetype") return "";
  const alias = aliases.get(font.id);
  if (!alias) return "";
  const styles2 = visualFontStyles(font.family, alias).filter(
    (style) => !style.startsWith("font-family:")
  );
  return `@font-face{font-family:${alias};src:url(data:font/ttf;base64,${base64(font.data)}) format("truetype");${styles2.join(";")}}`;
}
function visualFontStyles(fontFamily, alias) {
  const normalized = fontFamily?.toLowerCase() ?? "";
  const styles2 = [];
  let fallback;
  if (/courier|mono|nimbusmono|^cmtt/.test(normalized)) {
    fallback = "Courier New,Courier,monospace";
  } else if (/times|minion|serif|baskerville|georgia|nimbusrom|guardian.*egyp|^cm[rs]y?\d/.test(normalized)) {
    fallback = "Times New Roman,Times,serif";
  } else if (/helvetica|arial|sans|nimbussan|calibre|myriad|panton|^tte|^mstt/.test(normalized)) {
    fallback = "Arial,Helvetica,sans-serif";
  }
  if (alias || fallback) styles2.push(`font-family:${[alias, fallback].filter(Boolean).join(",")}`);
  if (/bold|black|semibold|demi|medi|^tte/.test(normalized)) styles2.push("font-weight:700");
  if (/italic|oblique|slant|ital(?:$|[_-])/.test(normalized)) styles2.push("font-style:italic");
  return styles2;
}
function base64(bytes) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    output += alphabet[first >> 2];
    output += alphabet[(first & 3) << 4 | second >> 4];
    output += index + 1 < bytes.length ? alphabet[(second & 15) << 2 | third >> 6] : "=";
    output += index + 2 < bytes.length ? alphabet[third & 63] : "=";
  }
  return output;
}
function semanticMedia(page) {
  const output = (page.images ?? []).map((image) => rasterMedia(image));
  const vector = vectorMedia(page);
  if (vector) output.push(vector);
  return output.sort((left, right) => right.bounds.y - left.bounds.y);
}
function rasterMedia(image) {
  const bounds = transformedUnitBounds(image.transform);
  const mime = image.format === "jpeg" ? "image/jpeg" : "image/bmp";
  const data = image.format === "jpeg" ? image.data : rgbBmp(image);
  const opacity = unitInterval(image.opacity) ? `;opacity:${number2(image.opacity)}` : "";
  return {
    bounds,
    html: `<img class="pdf-semantic-media" src="data:${mime};base64,${base64(data)}" width="${number2(bounds.width)}" height="${number2(bounds.height)}" alt="" style="max-width:100%;height:auto${opacity}">`
  };
}
function vectorMedia(page) {
  const paths = (page.paths ?? []).filter((path) => safePath(path.d));
  const fills = page.fills ?? [];
  const bounds = unionBounds([
    ...paths.map((path) => pathBounds(path.d)),
    ...fills.map(fillBounds)
  ]);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return void 0;
  const aliases = visualFontAliases(page.number, page.fonts ?? []);
  const visualCodeFonts = new Set(
    (page.fonts ?? []).filter((font) => font.format === "truetype" && font.visualCodeMapping).map((font) => font.id)
  );
  const visualSpans = page.visualSpans ?? page.spans;
  const overlay = visualSpans.filter(
    (span) => span.fontAssetId && visualCodeFonts.has(span.fontAssetId) && centerInside(span.bounds, bounds)
  );
  const consumedSpans = page.spans.filter(
    (span) => span.fontAssetId && visualCodeFonts.has(span.fontAssetId) && centerInside(span.bounds, bounds)
  );
  const fontIds = new Set(overlay.map((span) => span.fontAssetId));
  const fontFaces = (page.fonts ?? []).filter((font) => fontIds.has(font.id)).map((font) => visualFontFace(font, aliases)).join("");
  return {
    bounds,
    html: `<svg class="pdf-semantic-media" xmlns="http://www.w3.org/2000/svg" viewBox="${number2(bounds.x)} ${number2(page.height - bounds.y - bounds.height)} ${number2(bounds.width)} ${number2(bounds.height)}" style="display:block;max-width:100%;height:auto" aria-hidden="true">${fontFaces ? `<style>${fontFaces}</style>` : ""}<g transform="translate(0 ${number2(page.height)}) scale(1 -1)">${fills.map(vectorFill).join("") + paths.map((path) => vectorPath(path)).join("")}</g>${overlay.map((span) => vectorText(span, page.height, aliases)).join("")}</svg>`,
    ...consumedSpans.length > 0 ? { consumedSpans } : {}
  };
}
function withoutSemanticMediaSpans(page, media) {
  const consumed = new Set(media.flatMap((item) => item.consumedSpans ?? []));
  return consumed.size > 0 ? { ...page, spans: page.spans.filter((span) => !consumed.has(span)) } : page;
}
function vectorText(span, pageHeight, aliases) {
  if (span.renderingMode === 3 || span.renderingMode === 7) return "";
  const styles2 = [
    cssColor(span.color) ? `fill:${span.color}` : "",
    unitInterval(span.fillOpacity) ? `fill-opacity:${number2(span.fillOpacity)}` : "",
    ...visualFontStyles(
      span.fontFamily,
      span.fontAssetId ? aliases.get(span.fontAssetId) : void 0
    )
  ].filter(Boolean).join(";");
  const anchorY = pageHeight - span.bounds.y;
  const transform = span.transform;
  const position = transform ? ` x="0" y="0" transform="matrix(${transform.map(number2).join(" ")} ${number2(span.bounds.x)} ${number2(anchorY)})"` : ` x="${number2(span.bounds.x)}" y="${number2(anchorY)}"`;
  const extent = span.direction === "ttb" ? span.bounds.height : span.bounds.width;
  const length = extent > 0 ? ` textLength="${number2(extent)}" lengthAdjust="spacingAndGlyphs"` : "";
  return `<text${position} font-size="${number2(span.fontSize)}"${length}${styles2 ? ` style="${styles2}"` : ""}>${escapeHtml22(span.text)}</text>`;
}
function centerInside(inner, outer) {
  const x = inner.x + inner.width / 2;
  const y = inner.y + inner.height / 2;
  return x >= outer.x && x <= outer.x + outer.width && y >= outer.y && y <= outer.y + outer.height;
}
function vectorFill(fill) {
  const points = fill.points.map(([x, y]) => `${number2(x)},${number2(y)}`).join(" ");
  const opacity = unitInterval(fill.opacity) ? ` fill-opacity="${number2(fill.opacity)}"` : "";
  return cssColor(fill.color) ? `<polygon points="${points}" fill="${fill.color}"${opacity}/>` : "";
}
function vectorPath(path) {
  const fill = cssColor(path.fill) ? path.fill : "none";
  const stroke = cssColor(path.stroke) ? path.stroke : "none";
  const width = finiteNonnegative(path.strokeWidth) ? ` stroke-width="${number2(path.strokeWidth)}"` : "";
  const fillOpacity = unitInterval(path.fillOpacity) ? ` fill-opacity="${number2(path.fillOpacity)}"` : "";
  const strokeOpacity = unitInterval(path.strokeOpacity) ? ` stroke-opacity="${number2(path.strokeOpacity)}"` : "";
  const dash = path.strokeDasharray?.every(finiteNonnegative) ? ` stroke-dasharray="${path.strokeDasharray.map(number2).join(" ")}"` : "";
  const linecap = path.strokeLinecap ? ` stroke-linecap="${path.strokeLinecap}"` : "";
  const linejoin = path.strokeLinejoin ? ` stroke-linejoin="${path.strokeLinejoin}"` : "";
  const rule = path.fillRule ? ` fill-rule="${path.fillRule}"` : "";
  return `<path d="${path.d}" fill="${fill}" stroke="${stroke}"${width}${fillOpacity}${strokeOpacity}${dash}${linecap}${linejoin}${rule}/>`;
}
function transformedUnitBounds([a, b, c, d, e, f]) {
  const points = [
    [e, f],
    [a + e, b + f],
    [c + e, d + f],
    [a + c + e, b + d + f]
  ];
  const xs = points.map(([x]) => x ?? 0);
  const ys = points.map(([, y]) => y ?? 0);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}
function pathBounds(path) {
  const values = [...path.matchAll(/[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi)].map(
    (match) => Number(match[0])
  );
  if (values.length < 2) return void 0;
  const xs = [];
  const ys = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    xs.push(values[index] ?? 0);
    ys.push(values[index + 1] ?? 0);
  }
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}
function fillBounds(fill) {
  if (fill.points.length === 0) return void 0;
  const xs = fill.points.map(([x]) => x);
  const ys = fill.points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}
function unionBounds(bounds) {
  const values = bounds.filter((value) => Boolean(value));
  if (values.length === 0) return void 0;
  const x = Math.min(...values.map((value) => value.x));
  const y = Math.min(...values.map((value) => value.y));
  const right = Math.max(...values.map((value) => value.x + value.width));
  const top = Math.max(...values.map((value) => value.y + value.height));
  return { x, y, width: right - x, height: top - y };
}
function rgbBmp(image) {
  const stride = Math.ceil(image.width * 3 / 4) * 4;
  const output = new Uint8Array(54 + stride * image.height);
  const view = new DataView(output.buffer);
  output.set([66, 77]);
  view.setUint32(2, output.length, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, image.width, true);
  view.setInt32(22, -image.height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  for (let row = 0; row < image.height; row += 1) {
    for (let column = 0; column < image.width; column += 1) {
      const source = (row * image.width + column) * 3;
      const target = 54 + row * stride + column * 3;
      output[target] = image.data[source + 2] ?? 0;
      output[target + 1] = image.data[source + 1] ?? 0;
      output[target + 2] = image.data[source] ?? 0;
    }
  }
  return output;
}
function safePath(value) {
  return value.length <= 1e6 && /^[\d\s.,+\-eEMmLlCcZz]+$/.test(value);
}
function cssColor(value) {
  return /^#[\da-f]{6}$/i.test(value ?? "");
}
function finiteNonnegative(value) {
  return Number.isFinite(value) && (value ?? -1) >= 0;
}
function unitInterval(value) {
  return finiteNonnegative(value) && value <= 1;
}
function number2(value) {
  return Number.isFinite(value) ? String(Math.round(value * 1e3) / 1e3) : "0";
}
function escapeHtml22(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
async function writePage(page, write, options = {}) {
  if (resolveProfile(options) === "semantic") await writeFlowPage(page, write);
  else await writePositionedPage(page, write, options);
}
async function pageToHtml(page, options = {}) {
  let output = "";
  await writePage(
    page,
    (chunk) => {
      output += chunk;
    },
    options
  );
  return output;
}
async function writePositionedPage(page, write, options) {
  const visualSpans = page.visualSpans ?? page.spans;
  const reflectedOverlay = usesReflectedVisualOverlay(page, visualSpans);
  const quarterTurn = page.rotate === 90 || page.rotate === 270;
  const displayWidth = quarterTurn ? page.height : page.width;
  const displayHeight = quarterTurn ? page.width : page.height;
  await write(
    `<section class="pdf-page pdf-page--visual pdf-page--positioned" data-page="${page.number}" data-rotate="${page.rotate}" style="width:${number22(displayWidth)}pt;height:${number22(displayHeight)}pt">`
  );
  const fontAliases = visualFontAliases(page.number, page.fonts ?? []);
  const type3Fonts = new Map(
    (page.fonts ?? []).filter((font) => font.format === "type3").map((font) => [font.id, font])
  );
  if ((options.includeStyles ?? true) && page.fonts?.length) {
    await write(
      `<style>${page.fonts.map((font) => visualFontFace(font, fontAliases)).join("")}</style>`
    );
  }
  await write(
    `<div class="pdf-page-content pdf-page-content--${page.rotate}" style="width:${number22(page.width)}pt;height:${number22(page.height)}pt${rotationTransform(page)}">`
  );
  await write(
    `<svg class="pdf-visual-text" xmlns="http://www.w3.org/2000/svg" width="${number22(page.width)}pt" height="${number22(page.height)}pt" viewBox="0 0 ${number22(page.width)} ${number22(page.height)}">`
  );
  const clipDefinitions = imageClipDefinitions(page.images ?? [], page.number, page.height) + pathClipDefinitions(page.paths ?? [], page.number);
  if (clipDefinitions) await write(`<defs>${clipDefinitions}</defs>`);
  if (reflectedOverlay) {
    for (const [index, image] of (page.images ?? []).entries()) {
      await write(visualImage(image, page.height, page.number, index));
    }
  }
  for (const fill of page.fills ?? []) {
    const points = fill.points.map(([x, y]) => `${number22(x)},${number22(page.height - y)}`).join(" ");
    if (isCssHexColor(fill.color)) {
      const opacity = isUnitInterval(fill.opacity) ? ` fill-opacity="${number22(fill.opacity)}"` : "";
      await write(`<polygon points="${points}" fill="${fill.color}"${opacity}/>`);
    }
  }
  if (page.paths?.length) {
    await write(`<g transform="translate(0 ${number22(page.height)}) scale(1 -1)">`);
    for (const [pathIndex, path] of page.paths.entries()) {
      if (!isSvgPath(path.d)) continue;
      const fill = isCssHexColor(path.fill) ? path.fill : "none";
      const stroke = isCssHexColor(path.stroke) ? path.stroke : "none";
      const strokeWidth = path.strokeWidth !== void 0 && Number.isFinite(path.strokeWidth) && path.strokeWidth >= 0 ? ` stroke-width="${number22(path.strokeWidth)}"` : "";
      const fillRule = path.fillRule ? ` fill-rule="${path.fillRule}"` : "";
      const fillOpacity = isUnitInterval(path.fillOpacity) ? ` fill-opacity="${number22(path.fillOpacity)}"` : "";
      const strokeOpacity = isUnitInterval(path.strokeOpacity) ? ` stroke-opacity="${number22(path.strokeOpacity)}"` : "";
      const dasharray = path.strokeDasharray?.every((value) => Number.isFinite(value) && value >= 0) ? ` stroke-dasharray="${path.strokeDasharray.map(number22).join(" ")}"` : "";
      const dashoffset = Number.isFinite(path.strokeDashoffset) ? ` stroke-dashoffset="${number22(path.strokeDashoffset ?? 0)}"` : "";
      const linecap = path.strokeLinecap ? ` stroke-linecap="${path.strokeLinecap}"` : "";
      const linejoin = path.strokeLinejoin ? ` stroke-linejoin="${path.strokeLinejoin}"` : "";
      let output = `<path d="${path.d}" fill="${fill}" stroke="${stroke}"${strokeWidth}${fillOpacity}${strokeOpacity}${dasharray}${dashoffset}${linecap}${linejoin}${fillRule}/>`;
      for (let index = (path.clips?.length ?? 0) - 1; index >= 0; index -= 1) {
        output = `<g clip-path="url(#${pathClipId(page.number, pathIndex, index)})">${output}</g>`;
      }
      await write(output);
    }
    await write("</g>");
  }
  if (!reflectedOverlay) {
    for (const [index, image] of (page.images ?? []).entries()) {
      await write(visualImage(image, page.height, page.number, index));
    }
  }
  for (const span of visualSpans) {
    if (!usesPositionedSpan(span)) {
      const type3 = span.fontAssetId ? type3Fonts.get(span.fontAssetId) : void 0;
      await write(
        type3 ? visualType3Text(span, type3, page.height) : visualText(span, page.height, fontAliases, reflectedOverlay && page.rotate === 180)
      );
    }
  }
  await write("</svg>");
  for (const span of visualSpans) {
    if (usesPositionedSpan(span)) await write(positionedSpan(span, fontAliases));
  }
  await write("</div></section>");
}
function usesReflectedVisualOverlay(page, spans) {
  return Boolean(page.images?.length) && Boolean(page.paths?.length || page.fills?.length) && spans.length > 0 && spans.every(
    (span) => span.transform !== void 0 && Math.abs(span.transform[0] + 1) < 1e-6 && Math.abs(span.transform[1]) < 1e-6 && Math.abs(span.transform[2]) < 1e-6 && Math.abs(span.transform[3] - 1) < 1e-6
  );
}
function visualImage(image, pageHeight, pageNumber, imageIndex) {
  const [a, b, c, d, e, f] = image.transform;
  const transform = [a, -b, -c, d, c + e, pageHeight - d - f].map(number22).join(" ");
  const opacity = isUnitInterval(image.opacity) ? ` opacity="${number22(image.opacity)}"` : "";
  const mime = image.format === "jpeg" ? "image/jpeg" : "image/bmp";
  const data = image.format === "jpeg" ? image.data : rgbBmp2(image);
  let output = `<image width="1" height="1" preserveAspectRatio="none" transform="matrix(${transform})" href="data:${mime};base64,${base64(data)}"${opacity}/>`;
  for (let index = (image.clips?.length ?? 0) - 1; index >= 0; index -= 1) {
    output = `<g clip-path="url(#${imageClipId(pageNumber, imageIndex, index)})">${output}</g>`;
  }
  return output;
}
function imageClipDefinitions(images, pageNumber, pageHeight) {
  return images.flatMap(
    (image, imageIndex) => (image.clips ?? []).map((clip, clipIndex) => {
      if (!isSvgPath(clip.d)) return "";
      const fillRule = clip.fillRule ? ` clip-rule="${clip.fillRule}"` : "";
      return `<clipPath id="${imageClipId(pageNumber, imageIndex, clipIndex)}" clipPathUnits="userSpaceOnUse"><path d="${clip.d}" transform="translate(0 ${number22(pageHeight)}) scale(1 -1)"${fillRule}/></clipPath>`;
    })
  ).join("");
}
function imageClipId(pageNumber, imageIndex, clipIndex) {
  return `boxpdf-clip-${pageNumber}-${imageIndex}-${clipIndex}`;
}
function pathClipDefinitions(paths, pageNumber) {
  return paths.flatMap(
    (path, pathIndex) => (path.clips ?? []).map((clip, clipIndex) => {
      if (!isSvgPath(clip.d)) return "";
      const fillRule = clip.fillRule ? ` clip-rule="${clip.fillRule}"` : "";
      return `<clipPath id="${pathClipId(pageNumber, pathIndex, clipIndex)}" clipPathUnits="userSpaceOnUse"><path d="${clip.d}"${fillRule}/></clipPath>`;
    })
  ).join("");
}
function pathClipId(pageNumber, pathIndex, clipIndex) {
  return `boxpdf-path-clip-${pageNumber}-${pathIndex}-${clipIndex}`;
}
function rgbBmp2(image) {
  const stride = Math.ceil(image.width * 3 / 4) * 4;
  const output = new Uint8Array(54 + stride * image.height);
  const view = new DataView(output.buffer);
  output[0] = 66;
  output[1] = 77;
  view.setUint32(2, output.length, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, image.width, true);
  view.setInt32(22, -image.height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, stride * image.height, true);
  for (let row = 0; row < image.height; row += 1) {
    for (let column = 0; column < image.width; column += 1) {
      const source = (row * image.width + column) * 3;
      const target = 54 + row * stride + column * 3;
      output[target] = image.data[source + 2] ?? 0;
      output[target + 1] = image.data[source + 1] ?? 0;
      output[target + 2] = image.data[source] ?? 0;
    }
  }
  return output;
}
function rotationTransform(page) {
  switch (page.rotate) {
    case 90:
      return `;transform:translate(${number22(page.height)}pt,0) rotate(90deg)`;
    case 180:
      return `;transform:translate(${number22(page.width)}pt,${number22(page.height)}pt) rotate(180deg)`;
    case 270:
      return `;transform:translate(0,${number22(page.width)}pt) rotate(270deg)`;
    default:
      return "";
  }
}
function positionedSpan(span, fontAliases) {
  const direction = directionAttribute([span]);
  const style = [
    `left:${number22(span.bounds.x)}pt`,
    `bottom:${number22(span.bounds.y)}pt`,
    `width:${number22(span.bounds.width)}pt`,
    `height:${number22(span.bounds.height)}pt`,
    `font-size:${number22(span.fontSize)}pt`,
    ...isCssHexColor(span.color) ? [`color:${span.color}`] : [],
    ...isUnitInterval(span.fillOpacity) ? [`opacity:${number22(span.fillOpacity)}`] : [],
    ...visualFontStyles(
      span.fontFamily,
      span.fontAssetId ? fontAliases.get(span.fontAssetId) : void 0
    )
  ].join(";");
  return `<span class="pdf-span"${direction} style="${style}">${escapeHtml4(span.text)}</span>`;
}
async function writeFlowPage(page, write) {
  const media = semanticMedia(page);
  const structured = structurePage(withoutSemanticMediaSpans(page, media));
  const defaultColor = dominantTextColor(structured.lines);
  let mediaIndex = 0;
  await write(
    `<section class="pdf-page pdf-page--semantic pdf-page--flow" data-page="${page.number}">`
  );
  for (const block of structured.blocks) {
    const blockY = semanticBlockY2(block);
    while ((media[mediaIndex]?.bounds.y ?? -Infinity) >= blockY) {
      await write(`<div class="pdf-semantic-visual">${media[mediaIndex]?.html}</div>`);
      mediaIndex += 1;
    }
    if (block.type === "table") await write(tableToHtml(block.table));
    else if (block.type === "heading") {
      await write(
        `<h${block.level}>${semanticTextHtml(block.text, block.lines, defaultColor, false)}</h${block.level}>`
      );
    } else if (block.type === "paragraph") {
      await write(
        `<p${directionAttribute(block.lines.flatMap((line) => line.spans))}>${semanticTextHtml(block.text, block.lines, defaultColor)}</p>`
      );
    } else if (block.type === "preformatted") {
      await write(`<pre>${escapeHtml4(block.text)}</pre>`);
    } else if (block.type === "definitionList") {
      await write("<dl>");
      for (const entry of block.entries) {
        await write(
          `<div><dt>${escapeHtml4(entry.term)}</dt><dd>${escapeHtml4(entry.description)}</dd></div>`
        );
      }
      await write("</dl>");
    } else if (block.type === "cardList") {
      await write('<div class="pdf-semantic-cards">');
      for (const item of block.items) {
        await write(`<article><h3>${escapeHtml4(item.title)}</h3>`);
        for (const detail of item.details) await write(`<p>${escapeHtml4(detail)}</p>`);
        await write("</article>");
      }
      await write("</div>");
    } else if (block.type === "sectionGroup") {
      await write('<div class="pdf-semantic-sections">');
      for (const item of block.items) {
        await write(`<section><h3>${escapeHtml4(item.label)}</h3>`);
        for (const content of item.content) await write(`<p>${escapeHtml4(content)}</p>`);
        await write("</section>");
      }
      await write("</div>");
    } else if (block.type === "employment") {
      await write(
        `<section><h3>${escapeHtml4(block.role)}</h3><p>${escapeHtml4(block.organization)}</p><p>${escapeHtml4(block.date)}</p></section>`
      );
    } else {
      const tag = block.ordered ? "ol" : "ul";
      await write(`<${tag}>`);
      for (const item of block.items) {
        await write(`<li>${semanticTextHtml(item.text, item.lines, defaultColor)}</li>`);
      }
      await write(`</${tag}>`);
    }
  }
  while (mediaIndex < media.length) {
    await write(`<div class="pdf-semantic-visual">${media[mediaIndex]?.html}</div>`);
    mediaIndex += 1;
  }
  await write("</section>");
}
function semanticBlockY2(block) {
  const lines = block.type === "list" ? block.items.flatMap((item) => item.lines) : block.lines;
  return Math.max(...lines.map((line) => line.bounds.y + line.bounds.height));
}
function visualText(span, pageHeight, fontAliases, counterRotateReflectedText = false) {
  if (span.renderingMode === 3 || span.renderingMode === 7) return "";
  if (!span.fontAssetId && isAdobeCjkFont(span.fontFamily)) return "";
  const direction = directionAttribute([span]);
  const font = visualFontStyles(
    span.fontFamily,
    span.fontAssetId ? fontAliases.get(span.fontAssetId) : void 0
  ).join(";");
  const stroke = isCssHexColor(span.strokeColor) ? `stroke:${span.strokeColor}` : "";
  const strokeWidth = stroke && Number.isFinite(span.strokeWidth) && (span.strokeWidth ?? -1) >= 0 ? `stroke-width:${number22(span.strokeWidth ?? 0)}` : "";
  const strokeOnly = span.renderingMode === 1 || span.renderingMode === 5;
  const fillOpacity = isUnitInterval(span.fillOpacity) ? `fill-opacity:${number22(span.fillOpacity)}` : "";
  const strokeOpacity = isUnitInterval(span.strokeOpacity) ? `stroke-opacity:${number22(span.strokeOpacity)}` : "";
  const style = [
    isHebrewPaintOrder(span) ? "unicode-bidi:bidi-override;direction:ltr" : "",
    span.direction === "ttb" ? "writing-mode:vertical-rl" : "",
    strokeOnly ? "fill:none" : isCssHexColor(span.color) ? `fill:${span.color}` : "",
    stroke,
    strokeWidth,
    fillOpacity,
    strokeOpacity,
    font
  ].filter(Boolean).join(";");
  const textExtent = span.direction === "ttb" ? span.bounds.height : span.bounds.width;
  const textLength = textExtent > 0 && !isHebrewPaintOrder(span) ? ` textLength="${number22(textExtent)}" lengthAdjust="${span.direction === "ttb" || usesSpacingAdjustment(span) ? "spacing" : "spacingAndGlyphs"}"` : "";
  const transform = counterRotateReflectedText && span.transform ? [
    span.transform[0],
    span.transform[1],
    span.transform[2],
    -span.transform[3]
  ] : span.transform;
  const transformed = hasNonIdentityTransform(transform);
  const rtlOffset = span.direction === "rtl" ? span.bounds.width : 0;
  const basisX = transform?.[0] ?? 1;
  const basisY = transform?.[1] ?? 0;
  const anchorX = span.bounds.x + basisX * rtlOffset;
  const anchorY = pageHeight - span.bounds.y + basisY * rtlOffset;
  const position = transformed ? ` x="0" y="0" transform="matrix(${transform?.map(number22).join(" ")} ${number22(anchorX)} ${number22(anchorY)})"` : ` x="${number22(anchorX)}" y="${number22(anchorY)}"`;
  return `<text${direction}${position} font-size="${number22(span.fontSize)}"${textLength}${style ? ` style="${style}"` : ""}>${escapeHtml4(span.text)}</text>`;
}
function isAdobeCjkFont(fontFamily) {
  return /^Adobe(?:Heiti|Song|Kaiti|Ming|Gothic|Mincho)Std-/i.test(fontFamily ?? "");
}
function visualType3Text(span, font, pageHeight) {
  if (span.renderingMode === 3 || span.renderingMode === 7) return "";
  const glyphs = new Map(font.glyphs.map((glyph) => [glyph.code, glyph]));
  const sequence = (span.glyphCodes ?? []).map((code) => glyphs.get(code));
  const totalAdvance = sequence.reduce((total, glyph) => total + (glyph?.advance ?? 0), 0);
  if (totalAdvance <= 0 || span.bounds.width <= 0 || span.fontSize <= 0) return "";
  const transform = span.transform ?? [1, 0, 0, 1];
  const outer = `matrix(${transform.map(number22).join(" ")} ${number22(span.bounds.x)} ${number22(pageHeight - span.bounds.y)})`;
  const xScale = span.bounds.width / totalAdvance;
  let offset = 0;
  let content = "";
  for (const glyph of sequence) {
    if (!glyph) continue;
    content += `<g transform="translate(${number22(offset)} 0)">${type3Glyph(glyph, span.color)}</g>`;
    offset += glyph.advance;
  }
  return `<g transform="${outer}"><g transform="scale(${number22(xScale)} ${number22(-span.fontSize)})">${content}</g></g>`;
}
function isHebrewPaintOrder(span) {
  return span.direction === "ltr" && /[\u0590-\u05ff]/u.test(span.text);
}
function usesSpacingAdjustment(span) {
  return !span.fontAssetId && /arial/i.test(span.fontFamily ?? "");
}
function type3Glyph(glyph, textColor) {
  let output = "";
  for (const fill of glyph.fills ?? []) {
    const color = glyph.usesTextColor && isCssHexColor(textColor) ? textColor : fill.color;
    if (!isCssHexColor(color)) continue;
    const points = fill.points.map(([x, y]) => `${number22(x)},${number22(y)}`).join(" ");
    const opacity = isUnitInterval(fill.opacity) ? ` fill-opacity="${number22(fill.opacity)}"` : "";
    output += `<polygon points="${points}" fill="${color}"${opacity}/>`;
  }
  for (const path of glyph.paths ?? []) {
    if (!isSvgPath(path.d)) continue;
    const fill = glyph.usesTextColor && isCssHexColor(textColor) ? textColor : isCssHexColor(path.fill) ? path.fill : "none";
    const stroke = glyph.usesTextColor && isCssHexColor(textColor) && path.stroke ? textColor : isCssHexColor(path.stroke) ? path.stroke : "none";
    const width = path.strokeWidth !== void 0 && Number.isFinite(path.strokeWidth) && path.strokeWidth >= 0 ? ` stroke-width="${number22(path.strokeWidth)}"` : "";
    output += `<path d="${path.d}" fill="${fill}" stroke="${stroke}"${width}/>`;
  }
  return (glyph.fills?.length ?? 0) > 64 && glyph.advance > 2 ? `<g shape-rendering="crispEdges">${output}</g>` : output;
}
function isCssHexColor(value) {
  return /^#[\da-f]{6}$/i.test(value ?? "");
}
function isUnitInterval(value) {
  return Number.isFinite(value) && (value ?? -1) >= 0 && (value ?? 2) <= 1;
}
function isSvgPath(value) {
  return value.length <= 1e6 && /^[\d\s.,+\-eEMmLlCcZz]+$/.test(value);
}
function isMonospace(fontFamily) {
  return /courier|mono/i.test(fontFamily ?? "");
}
function usesPositionedSpan(span) {
  return !span.glyphCodes && isMonospace(span.fontFamily) && !hasNonIdentityTransform(span.transform);
}
function hasNonIdentityTransform(transform) {
  if (!transform) return false;
  const identity2 = [1, 0, 0, 1];
  return transform.some((value, index) => Math.abs(value - (identity2[index] ?? 0)) > 1e-6);
}
function directionAttribute(spans) {
  const rtl = spans.filter((span) => span.direction === "rtl").length;
  const vertical = spans.filter((span) => span.direction === "ttb").length;
  if (vertical > rtl && vertical * 2 >= spans.length) return ' data-direction="ttb"';
  return rtl * 2 >= spans.length && spans.length > 0 ? ' dir="rtl"' : "";
}
function number22(value) {
  return Number.isFinite(value) ? String(Math.round(value * 1e3) / 1e3) : "0";
}
function escapeHtml4(value) {
  return [...value].map((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint === 13) return "\n";
    return isForbiddenControl(codePoint) ? "\uFFFD" : character;
  }).join("").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function isForbiddenControl(codePoint) {
  return codePoint <= 8 || codePoint === 11 || codePoint === 12 || codePoint >= 14 && codePoint <= 31 || codePoint === 127;
}
function resolveProfile(options) {
  const legacyProfile = options.layout === "flow" ? "semantic" : "visual";
  if (options.profile && options.layout && options.profile !== legacyProfile) {
    throw new Error(
      `conflicting HTML output options: profile "${options.profile}" does not match layout "${options.layout}"`
    );
  }
  return options.profile ?? legacyProfile;
}

// docs/reader/demo.ts
var fixtures = [
  ["Rich content", "https://docs.boxpdf.dev/reader/rich-content.pdf"],
  ["Invoice", "https://docs.boxpdf.dev/reader/invoice.pdf"],
  ["Research paper", "https://docs.boxpdf.dev/reader/research-paper.pdf"],
  ["100 MiB \xB7 1,000 pages", "https://docs.boxpdf.dev/reader/thousand-pages-v2.pdf"],
  ["Utilities", "https://docs.boxpdf.dev/reader/utilities.pdf"],
  ["Clipping", "https://docs.boxpdf.dev/reader/clipping.pdf"],
  ["Receipt", "https://docs.boxpdf.dev/reader/receipt.pdf"]
];
var choices = document.querySelector("#fixture-choices");
var nativeFrame = document.querySelector("#native-frame");
var htmlFrame = document.querySelector("#html-frame");
var status = document.querySelector("#demo-status");
var metrics = {
  open: document.querySelector("#metric-open"),
  render: document.querySelector("#metric-render"),
  bytes: document.querySelector("#metric-bytes"),
  requests: document.querySelector("#metric-requests"),
  resident: document.querySelector("#metric-resident")
};
var run = 0;
htmlFrame.addEventListener("load", fitHtmlPage);
new ResizeObserver(fitHtmlPage).observe(htmlFrame);
for (const [label, url] of fixtures) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.url = url;
  button.addEventListener("click", () => void loadFixture(button, url));
  choices.append(button);
}
async function loadFixture(button, relativeUrl) {
  const currentRun = ++run;
  for (const choice of choices.querySelectorAll("button")) choice.classList.toggle("active", choice === button);
  const url = new URL(relativeUrl).href;
  nativeFrame.src = `${url}#toolbar=0&view=FitH`;
  htmlFrame.srcdoc = loadingDocument();
  status.textContent = "Opening with HTTP byte ranges\u2026";
  status.className = "demo-status loading";
  resetMetrics();
  let requests = 0;
  let transferred = 0;
  const measuredFetch = async (input, init) => {
    const response = await fetch(input, init);
    requests += 1;
    if (!response.body) return response;
    const counter = new TransformStream({
      transform(chunk, controller) {
        transferred += chunk.byteLength;
        controller.enqueue(chunk);
      }
    });
    return new Response(response.body.pipeThrough(counter), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  };
  let pdf;
  try {
    const started = performance.now();
    const source = await httpSource(url, { fetch: measuredFetch });
    pdf = await openPdf(source, {
      chunkSize: 1024 * 1024,
      maxBytes: 32 * 1024 * 1024,
      maxObjectCacheBytes: 16 * 1024 * 1024,
      maxObjectBytes: 4 * 1024 * 1024,
      maxXrefBytes: 1024 * 1024
    });
    const opened = performance.now();
    const pageCount = await pdf.getPageCount();
    const page = await pdf.getPage(0);
    const html = await pageToHtml(page, { profile: "visual" });
    const finished = performance.now();
    if (currentRun !== run) return;
    htmlFrame.srcdoc = renderedDocument(html);
    metrics.open.textContent = milliseconds(opened - started);
    metrics.render.textContent = milliseconds(finished - opened);
    metrics.bytes.textContent = formatBytes(transferred);
    metrics.requests.textContent = String(requests);
    metrics.resident.textContent = formatBytes(pdf.stats.peakResidentBytes + pdf.stats.peakObjectCacheBytes);
    status.textContent = `Page 1 of ${pageCount} \xB7 measured in this browser`;
    status.className = "demo-status ready";
  } catch (error) {
    if (currentRun !== run) return;
    status.textContent = error instanceof Error ? error.message : String(error);
    status.className = "demo-status error";
    htmlFrame.srcdoc = errorDocument(status.textContent);
  } finally {
    pdf?.close();
  }
}
function resetMetrics() {
  for (const value of Object.values(metrics)) value.textContent = "\u2014";
}
function milliseconds(value) {
  return `${value.toFixed(value < 10 ? 1 : 0)} ms`;
}
function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(2)} MiB`;
}
function renderedDocument(page) {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${frameStyles()}</style><main><div id="page-stage">${page}</div></main>`;
}
function loadingDocument() {
  return `<!doctype html><style>${frameStyles()}body{display:grid;place-items:center;color:#64748b;font:14px system-ui}</style><p>Reconstructing visual HTML\u2026</p>`;
}
function errorDocument(message) {
  return `<!doctype html><style>${frameStyles()}body{display:grid;place-items:center;color:#b42318;font:14px system-ui}</style><p>${escapeHtml3(message)}</p>`;
}
function frameStyles() {
  return `html,body{margin:0;min-height:100%;background:#fff}main{display:flex;justify-content:center;padding:8px;box-sizing:border-box}#page-stage{flex:none}.pdf-page{margin:0!important;border:1px solid #e2e8f0;box-shadow:0 4px 14px #0f172a1a;transform-origin:top left}`;
}
function fitHtmlPage() {
  const document2 = htmlFrame.contentDocument;
  const page = document2?.querySelector(".pdf-page");
  const stage = document2?.querySelector("#page-stage");
  if (!document2 || !page || !stage) return;
  page.style.transform = "none";
  const width = page.offsetWidth;
  const height = page.offsetHeight;
  const availableWidth = Math.max(1, document2.documentElement.clientWidth - 16);
  const scale = Math.min(1, availableWidth / width);
  page.style.transform = `scale(${scale})`;
  stage.style.width = `${width * scale}px`;
  stage.style.height = `${height * scale}px`;
}
function escapeHtml3(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
void (async () => {
  const first = choices.querySelector("button");
  await loadFixture(first, first.dataset.url);
})();
/*! Bundled license information:

pako/dist/pako.esm.mjs:
  (*! pako 2.2.0 https://github.com/nodeca/pako @license (MIT AND Zlib) *)
*/
