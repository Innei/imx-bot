export interface CheckRun {
  action: string
  check_run: Check_run
  repository: Repository
  sender: Sender
}
interface Check_run {
  id: number
  node_id: string
  head_sha: string
  external_id: string
  url: string
  html_url: string
  details_url: string
  status: string
  conclusion: null | string
  started_at: string
  completed_at: null
  output: Output
  name: string
  check_suite: Check_suite
  app: App
  pull_requests: PullRequestsItem[]
  deployment: Deployment
}
interface Output {
  title: null
  summary: null
  text: null
  annotations_count: number
  annotations_url: string
}
interface Check_suite {
  id: number
  node_id: string
  head_branch: string
  head_sha: string
  status: string
  conclusion: null
  url: string
  before: string
  after: string
  pull_requests: PullRequestsItem[]
  app: App
  created_at: string
  updated_at: string
}
interface PullRequestsItem {
  url: string
  id: number
  number: number
  head: Head
  base: Base
}
interface Head {
  ref: string
  sha: string
  repo: Repo
}
interface Repo {
  id: number
  url: string
  name: string
}
interface Base {
  ref: string
  sha: string
  repo: Repo
}
interface App {
  id: number
  node_id: string
  owner: Owner
  name: string
  description: string
  external_url: string
  html_url: string
  created_at: string
  updated_at: string
  permissions: Permissions
  events: any[]
}
interface Owner {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}
interface Permissions {
  administration: string
  checks: string
  contents: string
  deployments: string
  issues: string
  members: string
  metadata: string
  organization_administration: string
  organization_hooks: string
  organization_plan: string
  organization_projects: string
  organization_user_blocking: string
  pages: string
  pull_requests: string
  repository_hooks: string
  repository_projects: string
  statuses: string
  team_discussions: string
  vulnerability_alerts: string
}
interface Deployment {
  url: string
  id: number
  node_id: string
  task: string
  original_environment: string
  environment: string
  description: null
  created_at: string
  updated_at: string
  statuses_url: string
  repository_url: string
}
interface Repository {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: Owner
  html_url: string
  description: null
  fork: boolean
  url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  teams_url: string
  hooks_url: string
  issue_events_url: string
  events_url: string
  assignees_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  git_tags_url: string
  git_refs_url: string
  trees_url: string
  statuses_url: string
  languages_url: string
  stargazers_url: string
  contributors_url: string
  subscribers_url: string
  subscription_url: string
  commits_url: string
  git_commits_url: string
  comments_url: string
  issue_comment_url: string
  contents_url: string
  compare_url: string
  merges_url: string
  archive_url: string
  downloads_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  deployments_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  svn_url: string
  homepage: null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  forks_count: number
  mirror_url: null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: null
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
}
interface Sender {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}
