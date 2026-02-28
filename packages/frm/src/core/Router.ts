import { Handler, Method } from "./types";

export class TrieNode {
  path = "";
  isEnd = false;
  method: Method = "GET";
  handlers: Map<Method, Handler> = new Map();
  children: Map<string, TrieNode> = new Map();
}

type MatchResult = {
  handler: Handler;
  params: Record<string, string>;
  originalPath: string;
};

export class Router {
  private root: TrieNode = new TrieNode();

  add(method: Method, path: string, handler: Handler): void {
    const segments = path.split("/").filter(Boolean);
    // if (segments.length === 0) return;

    let node = this.root;
    for (const segment of segments) {
      if (!node.children.has(segment)) {
        const newNode = new TrieNode();
        newNode.path = segment;
        node.children.set(segment, newNode);
      }

      node = node.children.get(segment)!;
    }
    node.isEnd = true;
    node.method = method;
    node.handlers.set(method, handler);
  }

  match(method: Method, path: string): MatchResult | null {
    const segments = path.split("/").filter(Boolean);
    // if (segments.length === 0) return null;
    let node: TrieNode | null = this.root;
    const params: Record<string, string> = {};
    let i = 0;
    let originalPath = "";
    while (i < segments.length && node) {
      const segment = segments[i]!;
      // try exact match
      if (node.children.has(segment)) {
        node = node.children.get(segment)!;
        originalPath += `/${node.path}`;
        i++;
        continue;
      }
      // try dynamic match
      let isMatched = false;
      for (const [childPath, childNode] of node.children) {
        if (childPath.startsWith(":")) {
          params[childPath.slice(1)] = segment;
          node = childNode;
          originalPath += `/${node.path}`;
          isMatched = true;
          i++;
          break;
        }
      }

      if (!isMatched) {
        node = null;
        break;
      }
    }

    if (node && node.isEnd && node.handlers.has(method)) {
      const handler = node.handlers.get(method)!;
      return {
        handler,
        params,
        originalPath,
      };
    }
    return null;
  }

  // helper
  toString() {
    const routes: string[] = [];

    function traverse(node: TrieNode, routes: string[]) {
      const path = node.path ? `/${node.path}` : "";
      const method = node.method;
      // const isEnd = node.isEnd;
      routes.push(`${method} ${path}`);
      node.children.forEach((child) => {
        traverse(child, routes);
      });
    }

    this.root.children.forEach((child) => {
      traverse(child, routes);
    });

    return routes.length ? routes.join("\n") : "No routes found";
  }
}
