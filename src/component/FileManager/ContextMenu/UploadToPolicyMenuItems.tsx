import { ListItemText } from "@mui/material";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StoragePolicy } from "../../../api/explorer.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { uploadClickedWithPolicy } from "../../../redux/thunks/filemanager.ts";
import { SelectType } from "../../Uploader/core";
import { CascadingMenuItem } from "./CascadingMenu.tsx";

export interface UploadToPolicyMenuItemsProps {
  fmIndex: number;
  type: SelectType;
}

// UploadToPolicyMenuItems renders one entry per storage policy the current user's
// group is allowed to upload to, so the user can pick the destination policy when
// starting an upload.
const UploadToPolicyMenuItems = ({ fmIndex, type }: UploadToPolicyMenuItemsProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const policies = useAppSelector((state) => state.fileManager[fmIndex].list?.available_storage_policies);
  const defaultPolicy = useAppSelector((state) => state.fileManager[fmIndex].list?.storage_policy);

  const onClick = useCallback(
    (policy: StoragePolicy) => () => {
      dispatch(uploadClickedWithPolicy(fmIndex, type, policy.id));
    },
    [dispatch, fmIndex, type],
  );

  return (
    <>
      {policies?.map((policy) => (
        <CascadingMenuItem key={policy.id} onClick={onClick(policy)}>
          <ListItemText
            primary={policy.name}
            secondary={policy.id === defaultPolicy?.id ? t("application:fileManager.defaultPolicyTag") : undefined}
          />
        </CascadingMenuItem>
      ))}
    </>
  );
};

export default UploadToPolicyMenuItems;
