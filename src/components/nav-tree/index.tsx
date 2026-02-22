import classNames from "classnames";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "../link";
import s from "./NavTree.module.css";

export type NavTreeNode = FolderNode | LinkNode | BreakNode;

export type FolderNode = {
  type: "folder";
  title: string;
  path: string;
  open?: boolean;
  children: NavTreeNode[];
};

export type LinkNode = {
  type: "link";
  title: string;
  path: string;
  active?: boolean;
};

export type BreakNode = {
  type: "break";
};

interface NavTreeNodeGroup {
  rootPath: string;
  nodes: NavTreeNode[];
}

interface NavTreeProps {
  className?: string;
  nodeGroups: NavTreeNodeGroup[];
  // An optional callback, primarily used
  // by our mobile nav to tell it to close.
  onNavLinkClicked?: () => void;
  activeItemRef?: React.RefObject<HTMLLIElement | null>;
}

export default function NavTree({
  className,
  nodeGroups,
  onNavLinkClicked,
  activeItemRef,
}: NavTreeProps) {
  return (
    <div className={classNames(s.navTree, className)}>
      {nodeGroups.map(({ rootPath, nodes }) => {
        return (
          <NavTreeNodesList
            key={rootPath}
            path={rootPath}
            nodes={nodes}
            onNavLinkClicked={onNavLinkClicked}
            activeItemRef={activeItemRef}
          />
        );
      })}
    </div>
  );
}

function navTreeNodeKey(node: NavTreeNode, path: string): string {
  switch (node.type) {
    case "folder":
      return `folder:${path}${node.path}`;
    case "link":
      return `link:${path}${node.path}`;
    case "break":
      return `break:${path}`;
  }
}

interface NavTreeNodesListProps {
  path: string;
  nodes: NavTreeNode[];
  onNavLinkClicked?: () => void;
  activeItemRef?: React.RefObject<HTMLLIElement | null>;
}

function NavTreeNodesList({
  path,
  nodes,
  onNavLinkClicked,
  activeItemRef,
}: NavTreeNodesListProps) {
  const keyCounts = new Map<string, number>();

  return (
    <ul className={s.nodesList}>
      {nodes.map((node) => {
        const baseKey = navTreeNodeKey(node, path);
        const count = (keyCounts.get(baseKey) ?? 0) + 1;
        keyCounts.set(baseKey, count);

        return (
          <li
            key={`${baseKey}:${count}`}
            ref={node.type === "link" && node.active ? activeItemRef : null}
          >
            <Node
              path={path}
              node={node}
              onLinkNodeClicked={() => {
                onNavLinkClicked && onNavLinkClicked();
              }}
              activeItemRef={activeItemRef}
            />
          </li>
        );
      })}
    </ul>
  );
}

interface NodeProps {
  path: string;
  node: NavTreeNode;
  onLinkNodeClicked?: () => void;
  activeItemRef?: React.RefObject<HTMLLIElement | null>;
}

function Node({ path, node, onLinkNodeClicked, activeItemRef }: NodeProps) {
  switch (node.type) {
    case "folder":
      return (
        <FolderNode
          path={path}
          node={node}
          onLinkNodeClicked={onLinkNodeClicked}
          activeItemRef={activeItemRef}
        />
      );
    case "link":
      return (
        <LinkNode
          path={path}
          node={node}
          onClick={(e) => {
            onLinkNodeClicked && onLinkNodeClicked();
          }}
        />
      );
    case "break":
      return <BreakNode />;
    default:
      throw new Error(
        `Encountered an unexpected node type at ${path} \n\n ${JSON.stringify(
          node,
        )}`,
      );
  }
}

function BreakNode() {
  return <hr className={s.breakNode} />;
}

function FolderNode({
  path,
  node,
  onLinkNodeClicked,
  activeItemRef,
}: {
  path: string;
  node: FolderNode;
  onLinkNodeClicked?: () => void;
  activeItemRef?: React.RefObject<HTMLLIElement | null>;
}) {
  var [open, setOpen] = useState(node.open ? true : false);
  return (
    <div className={classNames(s.folderNode, { [s.isOpen]: open })}>
      <button type="button" onClick={() => setOpen(!open)}>
        {node.title}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className={s.children}>
          <NavTreeNodesList
            path={path + node.path}
            nodes={node.children}
            onNavLinkClicked={onLinkNodeClicked}
            activeItemRef={activeItemRef}
          />
        </div>
      )}
    </div>
  );
}

function LinkNode({
  path,
  node,
  onClick,
}: {
  path: string;
  node: LinkNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      onClick={onClick}
      href={path + node.path}
      className={classNames(s.linkNode, {
        [s.active]: node.active,
      })}
      text={node.title}
    />
  );
}
