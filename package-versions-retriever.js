const exec = require("child_process").exec;
const vscode = require("vscode");
const logger = require("./logger");
const Deferred = require("./deferred");

class AvailablePackageVersionsRetriever {
  constructor() {
    this._promisesForPackages = {};
    this._queueOfPackages = [];
  }

  getAvailablePackageVersions(packageName) {
    if (!!this._promisesForPackages[packageName]) {
      return this._promisesForPackages[packageName].getPromise();
    }

    const deferred = new Deferred();
    this._promisesForPackages[packageName] = deferred;
    this._queueOfPackages.push({
      packageName: packageName,
      deferred: deferred
    });

    if (this._queueOfPackages.length === 1) {
      this._executeGettingAvailableVersions();
    }

    return this._promisesForPackages[packageName].getPromise();
  }

  _executeGettingAvailableVersions() {
    if (this._queueOfPackages.length === 0) {
      return;
    }

    const numberOfSimultaneousRequests = Math.max(
      0,
      vscode.workspace.getConfiguration("checkNpmUpdates")[
        "numberOfSimultaneousRequests"
      ]
    );

    const numberOfRequests = Math.min(
      this._queueOfPackages.length,
      numberOfSimultaneousRequests
    );

    const packageInfos = this._queueOfPackages.slice(0, numberOfRequests);
    Promise.all(
      packageInfos.map(async packageInfo => {
        try {
          const versions = await this._getAvailablePackageVersionsWithRepeat(
            packageInfo.packageName,
            5
          );

          packageInfo.deferred.resolve(versions);
        } catch (error) {
          logger.logError(error);
          packageInfo.deferred.resolve([]);
        }
      })
    ).then(() => {
      this._queueOfPackages.splice(0, numberOfRequests);
      this._executeGettingAvailableVersions();
    });
  }

  async _getAvailablePackageVersionsWithRepeat(packageName, numberOfRepeats) {
    try {
      return await this._getAvailablePackageVersions(packageName);
    } catch (error) {
      if (numberOfRepeats > 0) {
        logger.logInfo(
          `Repeating getting available versions for ${packageName}. ${numberOfRepeats} repeats left.`
        );
        return await this._getAvailablePackageVersionsWithRepeat(
          packageName,
          numberOfRepeats - 1
        );
      }
      throw new Error(error);
    }
  }

  _getAvailablePackageVersions(packageName) {
    return new Promise((resolve, reject) => {
      logger.logInfo(
        `Getting available package versions for ${packageName}...`
      );

      exec(
        `npm show ${packageName} versions --json`,
        (error, stdout, stderr) => {
          if (error) {
            logger.logError(
              `Unable to get available package versions for ${packageName}`
            );
            reject(error);
            return;
          }

          if (stderr) {
            logger.logError(
              `Unable to get available package versions for ${packageName}`
            );
            reject(stderr);
            return;
          }

          resolve(JSON.parse(stdout));
        }
      );
    });
  }

  collectAvailableVersions(packages) {
    return Promise.all(
      packages.map(async packageInfo => {
        const currentPackageInfo = packageInfo;

        try {
          const versionsJson = await this.getAvailablePackageVersions(
            packageInfo.packageName
          );

          currentPackageInfo.availableVersions = versionsJson;
        } catch (error) {
          logger.logError(error);
        }
      })
    );
  }
}

exports.AvailablePackageVersionsRetriever = AvailablePackageVersionsRetriever;
