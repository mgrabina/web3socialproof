import { VersionInfo } from './VersionInfo';
export const getVersionInfo = () => {
    if (VersionInfo.tag !== '') {
        return VersionInfo.tag;
    }
    if (VersionInfo.commit !== '') {
        return `${VersionInfo.branch} [${VersionInfo.commit.substring(0, 7)}]`;
    }
    return 'Local build';
};
