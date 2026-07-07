import { Box, FormControl, SelectChangeEvent, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStoragePolicyList } from "../../../../api/api";
import { StoragePolicy } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import FacebookCircularProgress from "../../../Common/CircularProgress";
import { DenseSelect, SquareChip } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";

export interface PolicySelectionInputProps {
  // In single mode `value` is a policy id; in multiple mode it is an array of ids.
  value: number | number[];
  onChange: (value: number | number[]) => void;
  // multiple turns the select into a multi-select bound to a number[].
  multiple?: boolean;
  // restrictToIds, when set, limits the selectable options to this id set. Used by the
  // default-policy selector to only allow picking within the chosen available set.
  restrictToIds?: number[];
}

const PolicySelectionInput = ({ value, onChange, multiple, restrictToIds }: PolicySelectionInputProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [policies, setPolicies] = useState<StoragePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [policyMap, setPolicyMap] = useState<Record<number, StoragePolicy>>({});

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value: v },
    } = event;
    if (multiple) {
      const arr = (typeof v === "string" ? v.split(",").map((s) => parseInt(s)) : (v as number[])) ?? [];
      onChange(arr);
    } else {
      onChange(v as number);
    }
  };

  useEffect(() => {
    setLoading(true);
    dispatch(getStoragePolicyList({ page: 1, page_size: 1000, order_by: "id", order_direction: "asc" }))
      .then((res) => {
        setPolicies(res.policies);
        setPolicyMap(
          res.policies.reduce(
            (acc, policy) => {
              acc[policy.id] = policy;
              return acc;
            },
            {} as Record<number, StoragePolicy>,
          ),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const options = useMemo(() => {
    if (restrictToIds) {
      const allowed = new Set(restrictToIds);
      return policies.filter((p) => allowed.has(p.id));
    }
    return policies;
  }, [policies, restrictToIds]);

  return (
    <FormControl fullWidth>
      <DenseSelect
        value={value}
        multiple={multiple}
        required
        onChange={handleChange}
        sx={{
          minHeight: 39,
        }}
        disabled={loading}
        MenuProps={{
          PaperProps: { sx: { maxWidth: 230 } },
          MenuListProps: {
            sx: {
              "& .MuiMenuItem-root": {
                whiteSpace: "normal",
              },
            },
          },
        }}
        renderValue={(selected: unknown) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {!loading ? (
              multiple ? (
                (selected as number[]).map((id) => <SquareChip size="small" key={id} label={policyMap[id]?.name} />)
              ) : (
                <SquareChip size="small" key={selected as number} label={policyMap[selected as number]?.name} />
              )
            ) : (
              <FacebookCircularProgress size={20} sx={{ mt: "1px" }} />
            )}
          </Box>
        )}
      >
        {options.length > 0 &&
          options.map((policy) => (
            <SquareMenuItem key={policy.id} value={policy.id}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant={"body2"} fontWeight={600}>
                  {policy.name}
                </Typography>
                <Typography variant={"caption"} color={"textSecondary"}>
                  {t(`policy.${policy.type}`)}
                </Typography>
              </Box>
            </SquareMenuItem>
          ))}
      </DenseSelect>
    </FormControl>
  );
};

export default PolicySelectionInput;
