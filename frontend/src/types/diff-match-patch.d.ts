declare module 'diff-match-patch' {
  export class diff_match_patch {
    constructor();
    diff_main(text1: string, text2: string): [number, string][];
    diff_cleanupSemantic(diffs: [number, string][]): void;
  }
} 