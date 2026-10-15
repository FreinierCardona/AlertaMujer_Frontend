const contactAlertsRoot = '/api/v1/me/contact-alerts';

export const contactAlertPaths = {
  list: (page: number, size: number) => `${contactAlertsRoot}?page=${page}&size=${size}`,
  detail: (emergencyId: string) => `${contactAlertsRoot}/${emergencyId}`,
  evidences: (emergencyId: string) => `${contactAlertsRoot}/${emergencyId}/evidences`,
  evidenceContent: (emergencyId: string, evidenceId: string) =>
    `${contactAlertsRoot}/${emergencyId}/evidences/${evidenceId}/content`,
};
