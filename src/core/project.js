// @flow

import base64url from "base64url";
import {type RepoId} from "../plugins/github/repoId";
import {toCompat, fromCompat, type Compatible} from "../util/compat";
import {type ProjectOptions as Initiatives} from "../plugins/initiatives/projectOptions";
import {type Identity} from "../plugins/identity/identity";
import {type DiscourseServer} from "../plugins/discourse/server";

export type ProjectId = string;

/**
 * A project represents a scope for cred analysis.
 *
 * Right now it has an `id` (which should be unique across a user's projects)
 * and an array of GitHub RepoIds.
 *
 * In the future, instead of hardcoding support for plugins like GitHub and Discourse,
 * we will have a generic system for storing plugin-specific config, keyed by plugin
 * identifier.
 *
 * We may add more fields (e.g. a description) to this object in the future.
 *
 * We may create a complimentary object with load/cache info for the project in
 * the future (e.g. showing the last update time for each of the project's data
 * dependencies).
 */
export type Project = ProjectV050;
export type SupportedProject =
  | ProjectV030
  | ProjectV031
  | ProjectV040
  | ProjectV050;

type ProjectV050 = {|
  +id: ProjectId,
  +initiatives: Initiatives | null,
  +repoIds: $ReadOnlyArray<RepoId>,
  +discourseServer: DiscourseServer | null,
  +identities: $ReadOnlyArray<Identity>,
|};

const COMPAT_INFO = {type: "sourcecred/project", version: "0.5.0"};

/**
 * Creates a new Project instance with default values.
 *
 * Note: the `id` field is required, as there's no sensible default.
 */
export function createProject(p: $Shape<Project>): Project {
  if (!p.id) {
    throw new Error("Project.id must be set");
  }

  return {
    repoIds: [],
    identities: [],
    discourseServer: null,
    initiatives: null,
    ...p,
  };
}

export type ProjectJSON = Compatible<Project>;

export function projectToJSON(p: Project): ProjectJSON {
  return toCompat(COMPAT_INFO, p);
}

export function projectFromJSON(j: Compatible<any>): Project {
  return fromCompat(COMPAT_INFO, j, upgrades);
}

/**
 * Encode the project ID so it can be stored on the filesystem,
 * or retrieved via XHR from the frontend.
 */
export function encodeProjectId(id: ProjectId): string {
  return base64url.encode(id);
}

const upgradeFrom040 = (p: ProjectV040): ProjectV050 => ({
  ...p,
  initiatives: null,
});

type ProjectV040 = {|
  +id: ProjectId,
  +repoIds: $ReadOnlyArray<RepoId>,
  +discourseServer: DiscourseServer | null,
  +identities: $ReadOnlyArray<Identity>,
|};

const upgradeFrom030 = (p: ProjectV030 | ProjectV031) =>
  upgradeFrom040({
    ...p,
    discourseServer:
      p.discourseServer != null
        ? {serverUrl: p.discourseServer.serverUrl}
        : null,
  });

type ProjectV031 = {|
  +id: ProjectId,
  +repoIds: $ReadOnlyArray<RepoId>,
  +discourseServer: {|
    +serverUrl: string,
    +apiUsername?: string,
  |} | null,
  +identities: $ReadOnlyArray<Identity>,
|};

type ProjectV030 = {|
  +id: ProjectId,
  +repoIds: $ReadOnlyArray<RepoId>,
  +discourseServer: {|
    +serverUrl: string,
    +apiUsername: string,
  |} | null,
  +identities: $ReadOnlyArray<Identity>,
|};

const upgrades = {
  "0.3.0": upgradeFrom030,
  "0.3.1": upgradeFrom030,
  "0.4.0": upgradeFrom040,
};
