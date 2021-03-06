// @flow

import {NodeAddress} from "../graph";
import {distributionToCred} from "./distributionToCred";

describe("src/core/algorithm/distributionToCred", () => {
  const na = (...parts) => NodeAddress.fromParts(parts);
  describe("distributionToCred", () => {
    it("works in a case where all nodes are scoring", () => {
      const ds = [
        {
          interval: {startTimeMs: 0, endTimeMs: 10},
          intervalWeight: 2,
          distribution: new Float64Array([0.5, 0.5]),
        },
        {
          interval: {startTimeMs: 10, endTimeMs: 20},
          intervalWeight: 10,
          distribution: new Float64Array([0.9, 0.1]),
        },
      ];
      const nodeOrder = [na("foo"), na("bar")];
      const actual = distributionToCred(ds, nodeOrder, [NodeAddress.empty]);
      const expected = {
        intervals: [
          {startTimeMs: 0, endTimeMs: 10},
          {startTimeMs: 10, endTimeMs: 20},
        ],
        intervalCredScores: [
          new Float64Array([1, 1]),
          new Float64Array([9, 1]),
        ],
      };
      expect(expected).toEqual(actual);
    });
    it("correctly handles multiple scoring prefixes", () => {
      const ds = [
        {
          interval: {startTimeMs: 0, endTimeMs: 10},
          intervalWeight: 2,
          distribution: new Float64Array([0.5, 0.5]),
        },
        {
          interval: {startTimeMs: 10, endTimeMs: 20},
          intervalWeight: 10,
          distribution: new Float64Array([0.9, 0.1]),
        },
      ];
      const nodeOrder = [na("foo"), na("bar")];
      const actual = distributionToCred(ds, nodeOrder, [na("foo"), na("bar")]);
      const expected = {
        intervals: [
          {startTimeMs: 0, endTimeMs: 10},
          {startTimeMs: 10, endTimeMs: 20},
        ],
        intervalCredScores: [
          new Float64Array([1, 1]),
          new Float64Array([9, 1]),
        ],
      };
      expect(expected).toEqual(actual);
    });
    it("works in a case where some nodes are scoring", () => {
      const ds = [
        {
          interval: {startTimeMs: 0, endTimeMs: 10},
          intervalWeight: 2,
          distribution: new Float64Array([0.5, 0.5]),
        },
        {
          interval: {startTimeMs: 10, endTimeMs: 20},
          intervalWeight: 10,
          distribution: new Float64Array([0.9, 0.1]),
        },
      ];
      const nodeOrder = [na("foo"), na("bar")];
      const actual = distributionToCred(ds, nodeOrder, [na("bar")]);
      const expected = {
        intervals: [
          {startTimeMs: 0, endTimeMs: 10},
          {startTimeMs: 10, endTimeMs: 20},
        ],
        intervalCredScores: [
          new Float64Array([2, 2]),
          new Float64Array([90, 10]),
        ],
      };
      expect(expected).toEqual(actual);
    });
    it("handles the case where no nodes are scoring", () => {
      const ds = [
        {
          interval: {startTimeMs: 0, endTimeMs: 10},
          intervalWeight: 2,
          distribution: new Float64Array([0.5, 0.5]),
        },
      ];
      const nodeOrder = [na("foo"), na("bar")];
      const actual = distributionToCred(ds, nodeOrder, []);
      const expected = {
        intervals: [{startTimeMs: 0, endTimeMs: 10}],
        intervalCredScores: [new Float64Array([0, 0])],
      };
      expect(actual).toEqual(expected);
    });

    it("handles the case where all nodes' cred sums to zero", () => {
      const ds = [
        {
          interval: {startTimeMs: 0, endTimeMs: 10},
          intervalWeight: 2,
          distribution: new Float64Array([1, 0]),
        },
      ];
      const nodeOrder = [na("foo"), na("bar")];
      const actual = distributionToCred(ds, nodeOrder, [na("bar")]);
      const expected = {
        intervals: [{startTimeMs: 0, endTimeMs: 10}],
        intervalCredScores: [new Float64Array([0, 0])],
      };
      expect(actual).toEqual(expected);
    });

    it("returns empty CredScores if no intervals are present", () => {
      expect(distributionToCred([], [], [])).toEqual({
        intervals: [],
        intervalCredScores: [],
      });
    });
  });
});
