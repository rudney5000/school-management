import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "@shared/store/index.ts";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);