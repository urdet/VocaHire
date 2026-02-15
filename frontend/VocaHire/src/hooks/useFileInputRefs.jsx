import { useRef } from "react";

export default function useFileInputRefs() {
  const refs = useRef({});
  return refs;
}