import { z } from "zod";

export const getProfilesSchema = z
  .object({
    group_id: z.number().positive().optional(),
    page: z.number().int().positive().default(1),
    per_page: z.number().int().positive().default(50),
    sort: z
      .enum(["NEWEST", "OLDEST", "A-Z", "Z-A"])
      .optional()
      .transform((v) => {
        if (!v) return undefined;
        if (v === "NEWEST") return 0;
        if (v === "OLDEST") return 1;
        if (v === "A-Z") return 2;
        if (v === "Z-A") return 3;
      }),
    /**
     * @description Search by profile name.
     */
    search: z.string().trim().optional(),
  })
  .optional();

export const startProfileSchema = z
  .object({
    // addination_args: z.string().trim().optional(),
    win_scale: z.number().min(0).max(1).default(0.8),
    /**
     * @description [x, y]
     */
    win_pos: z
      .tuple([
        z.number().positive().optional(),
        z.number().positive().optional(),
      ])
      .optional(),
    /**
     * @description [width, height]
     */
    win_size: z
      .tuple([
        z.number().positive().optional(),
        z.number().positive().optional(),
      ])
      .optional(),
  })
  .optional();
