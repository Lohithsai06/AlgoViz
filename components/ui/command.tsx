'use client';

import * as React from 'react';

// Stubbed Command components to avoid dependency on `cmdk`.
// These provide no-op / minimal implementations so that
// any imports remain valid but no runtime dependency on cmdk exists.

const Command: React.FC<React.PropsWithChildren<any>> = ({ children }) => <>{children}</>;
const CommandDialog: React.FC<React.PropsWithChildren<any>> = ({ children }) => <>{children}</>;
const CommandInput: React.FC<React.PropsWithChildren<any>> = () => null;
const CommandList: React.FC<React.PropsWithChildren<any>> = ({ children }) => <>{children}</>;
const CommandEmpty: React.FC = () => null;
const CommandGroup: React.FC<React.PropsWithChildren<any>> = ({ children }) => <>{children}</>;
const CommandItem: React.FC<React.PropsWithChildren<any>> = ({ children }) => <>{children}</>;
const CommandShortcut: React.FC<React.PropsWithChildren<any>> = ({ children }) => <span>{children}</span>;
const CommandSeparator: React.FC = () => null;

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
