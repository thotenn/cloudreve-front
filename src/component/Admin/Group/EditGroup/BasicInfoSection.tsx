import { Alert, FormControl, FormControlLabel, Switch, Typography } from "@mui/material";
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GroupEnt, StoragePolicy } from "../../../../api/dashboard";
import { GroupPermission } from "../../../../api/user";
import Boolset from "../../../../util/boolset";
import SizeInput from "../../../Common/SizeInput";
import { DenseFilledTextField } from "../../../Common/StyledComponents";
import InPrivate from "../../../Icons/InPrivate";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { NoMarginHelperText, SettingSection, SettingSectionContent } from "../../Settings/Settings";
import { AnonymousGroupID } from "../GroupRow";
import { GroupSettingContext } from "./GroupSettingWrapper";
import PolicySelectionInput from "./PolicySelectionInput";
const BasicInfoSection = () => {
  const { t } = useTranslation("dashboard");
  const { values, setGroup } = useContext(GroupSettingContext);

  const permission = useMemo(() => {
    return new Boolset(values.permissions ?? "");
  }, [values.permissions]);

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGroup((p: GroupEnt) => ({ ...p, name: e.target.value }));
    },
    [setGroup],
  );

  const allowedPolicyIds = useMemo(
    () => (values.edges.storage_policies_allowed ?? []).map((p) => p.id),
    [values.edges.storage_policies_allowed],
  );
  const defaultPolicyId = values.edges.storage_policies?.id ?? 0;

  const onAvailablePoliciesChange = useCallback(
    (value: number | number[]) => {
      const ids = value as number[];
      setGroup((p: GroupEnt) => {
        const currentDefault = p.edges.storage_policies?.id ?? 0;
        // Keep the default within the allowed set: fall back to the first selected
        // policy when the current default is no longer part of it.
        const nextDefault = ids.includes(currentDefault) ? currentDefault : (ids[0] ?? 0);
        return {
          ...p,
          edges: {
            ...p.edges,
            storage_policies_allowed: ids.map((id) => ({ id }) as StoragePolicy),
            storage_policies: { id: nextDefault } as StoragePolicy,
          },
        };
      });
    },
    [setGroup],
  );

  const onDefaultPolicyChange = useCallback(
    (value: number | number[]) => {
      setGroup((p: GroupEnt) => ({
        ...p,
        edges: { ...p.edges, storage_policies: { id: value as number } as StoragePolicy },
      }));
    },
    [setGroup],
  );

  const onMaxStorageChange = useCallback(
    (size: number) => {
      setGroup((p: GroupEnt) => ({
        ...p,
        max_storage: size ? size : undefined,
      }));
    },
    [setGroup],
  );

  const onIsAdminChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGroup((p: GroupEnt) => ({
        ...p,
        permissions: new Boolset(p.permissions).set(GroupPermission.is_admin, e.target.checked).toString(),
      }));
    },
    [setGroup],
  );

  return (
    <SettingSection>
      <Typography variant="h6" gutterBottom>
        {t("policy.basicInfo")}
      </Typography>
      <SettingSectionContent>
        {values?.id == AnonymousGroupID && (
          <SettingForm lgWidth={5}>
            <Alert icon={<InPrivate fontSize="inherit" />} severity="info">
              {t("group.anonymousHint")}
            </Alert>
          </SettingForm>
        )}
        <SettingForm title={t("group.nameOfGroup")} lgWidth={5}>
          <FormControl fullWidth>
            <DenseFilledTextField required value={values.name} onChange={onNameChange} />
            <NoMarginHelperText>{t("group.nameOfGroupDes")}</NoMarginHelperText>
          </FormControl>
        </SettingForm>
        {values?.id != AnonymousGroupID && (
          <>
            <SettingForm title={t("group.availablePolicies")} lgWidth={5}>
              <PolicySelectionInput multiple value={allowedPolicyIds} onChange={onAvailablePoliciesChange} />
              <NoMarginHelperText>{t("group.availablePoliciesDes")}</NoMarginHelperText>
            </SettingForm>
            {allowedPolicyIds.length > 1 && (
              <SettingForm title={t("group.defaultPolicy")} lgWidth={5}>
                <PolicySelectionInput
                  value={defaultPolicyId}
                  onChange={onDefaultPolicyChange}
                  restrictToIds={allowedPolicyIds}
                />
                <NoMarginHelperText>{t("group.defaultPolicyDes")}</NoMarginHelperText>
              </SettingForm>
            )}
            <SettingForm title={t("group.initialStorageQuota")} lgWidth={5}>
              <FormControl fullWidth>
                <SizeInput
                  variant={"outlined"}
                  required
                  value={values.max_storage ?? 0}
                  onChange={onMaxStorageChange}
                />
                <NoMarginHelperText>{t("group.initialStorageQuotaDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  disabled={values.id == 1}
                  control={<Switch checked={permission.enabled(GroupPermission.is_admin)} onChange={onIsAdminChange} />}
                  label={t("group.isAdmin")}
                />
                <NoMarginHelperText>{t("group.isAdminDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </>
        )}
      </SettingSectionContent>
    </SettingSection>
  );
};

export default BasicInfoSection;
