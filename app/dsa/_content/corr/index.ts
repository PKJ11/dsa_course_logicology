import type { ComponentType } from "react";
import Lesson1 from "./lesson1";
import Lesson2 from "./lesson2";
import Lesson3 from "./lesson3";
import Lesson4 from "./lesson4";
import Lesson5 from "./lesson5";

export const CORR_BODIES: Record<number, ComponentType> = { 1: Lesson1, 2: Lesson2, 3: Lesson3, 4: Lesson4, 5: Lesson5 };
