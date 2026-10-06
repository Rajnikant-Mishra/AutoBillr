const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getCompanyId = async (req) => {
  // Preferred: auth middleware already provides companyId
  if (req.companyId) {
    return req.companyId;
  }

  // Some auth middleware stores it under req.user
  if (req.user?.companyId) {
    return req.user.companyId;
  }

  // Fallback: resolve company from authenticated user ID
  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.auth?.userId;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      companyId: true,
    },
  });

  return user?.companyId || null;
};

/*
|--------------------------------------------------------------------------
| GET SETTINGS
|--------------------------------------------------------------------------
| GET /api/v1/settings
|--------------------------------------------------------------------------
*/

const getSettings = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company could not be identified.",
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        company,
      },
    });
  } catch (error) {
    console.error(
      "GET SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load settings.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET BRANDING
|--------------------------------------------------------------------------
| GET /api/v1/settings/branding
|--------------------------------------------------------------------------
*/

const getBranding = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company could not be identified.",
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        logo: true,
        brandColor: true,
        showQr: true,
        showThumbnails: true,
        showFooter: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        branding: company,
      },
    });
  } catch (error) {
    console.error(
      "GET BRANDING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load branding settings.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BRANDING
|--------------------------------------------------------------------------
| PUT /api/v1/settings/branding
|--------------------------------------------------------------------------
|
| Handles:
| - brandColor
| - showQr
| - showThumbnails
| - showFooter
|
| Logo is handled separately through multipart upload.
|--------------------------------------------------------------------------
*/

const updateBranding = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company could not be identified.",
      });
    }

    const {
      brandColor,
      showQr,
      showThumbnails,
      showFooter,
    } = req.body;

    const data = {};

    /*
     * Brand color
     */
    if (brandColor !== undefined) {
      if (
        typeof brandColor !== "string" ||
        !/^#[0-9A-Fa-f]{6}$/.test(
          brandColor
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "brandColor must be a valid HEX color.",
        });
      }

      data.brandColor = brandColor;
    }

    /*
     * QR
     */
    if (showQr !== undefined) {
      data.showQr =
        showQr === true ||
        showQr === "true";
    }

    /*
     * Thumbnails
     */
    if (showThumbnails !== undefined) {
      data.showThumbnails =
        showThumbnails === true ||
        showThumbnails === "true";
    }

    /*
     * Footer
     */
    if (showFooter !== undefined) {
      data.showFooter =
        showFooter === true ||
        showFooter === "true";
    }

    const company =
      await prisma.company.update({
        where: {
          id: companyId,
        },
        data,
        select: {
          id: true,
          logo: true,
          brandColor: true,
          showQr: true,
          showThumbnails: true,
          showFooter: true,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Branding settings updated successfully.",
      data: {
        branding: company,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE BRANDING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update branding settings.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPLOAD LOGO
|--------------------------------------------------------------------------
| POST /api/v1/settings/branding/logo
|--------------------------------------------------------------------------
|
| Multer places the uploaded file at:
|
| req.file
|
| The database stores ONLY the public path:
|
| /uploads/branding/companyId/filename.png
|
|--------------------------------------------------------------------------
*/

const uploadLogo = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company could not be identified.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a logo image.",
      });
    }

    /*
     * Find existing logo before replacing it.
     */
    const existingCompany =
      await prisma.company.findUnique({
        where: {
          id: companyId,
        },
        select: {
          logo: true,
        },
      });

    /*
     * Public URL stored in PostgreSQL.
     *
     * Example:
     * /uploads/branding/cmg123/logo-123456.png
     */
    const logoUrl =
      `/uploads/branding/${companyId}/${req.file.filename}`;

    /*
     * Update database.
     */
    const company =
      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: {
          logo: logoUrl,
        },
        select: {
          id: true,
          logo: true,
          brandColor: true,
          showQr: true,
          showThumbnails: true,
          showFooter: true,
        },
      });

    /*
     * Delete previous custom logo from disk.
     *
     * Don't delete anything if it is an external URL.
     */
    if (
      existingCompany?.logo &&
      existingCompany.logo.startsWith(
        "/uploads/"
      )
    ) {
      const oldRelativePath =
        existingCompany.logo.replace(
          /^\/uploads\//,
          ""
        );

      const oldFilePath = path.join(
        process.cwd(),
        "uploads",
        oldRelativePath
      );

      /*
       * Never allow path traversal.
       */
      const uploadsRoot = path.resolve(
        process.cwd(),
        "uploads"
      );

      const resolvedOldPath =
        path.resolve(oldFilePath);

      if (
        resolvedOldPath.startsWith(
          uploadsRoot
        )
      ) {
        try {
          await fs.promises.unlink(
            resolvedOldPath
          );
        } catch (deleteError) {
          /*
           * File may already be missing.
           * Database update is still successful.
           */
          if (
            deleteError.code !==
            "ENOENT"
          ) {
            console.error(
              "OLD LOGO DELETE ERROR:",
              deleteError
            );
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Logo uploaded successfully.",
      data: {
        branding: company,
      },
    });
  } catch (error) {
    /*
     * If database update fails after multer
     * already stored the file, remove the new file.
     */
    if (req.file?.path) {
      try {
        await fs.promises.unlink(
          req.file.path
        );
      } catch (cleanupError) {
        console.error(
          "UPLOAD CLEANUP ERROR:",
          cleanupError
        );
      }
    }

    console.error(
      "UPLOAD LOGO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload logo.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE LOGO
|--------------------------------------------------------------------------
| DELETE /api/v1/settings/branding/logo
|--------------------------------------------------------------------------
*/

const deleteLogo = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company could not be identified.",
      });
    }

    /*
     * Get current logo.
     */
    const company =
      await prisma.company.findUnique({
        where: {
          id: companyId,
        },
        select: {
          logo: true,
        },
      });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    /*
     * Remove logo from database first.
     */
    const updatedCompany =
      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: {
          logo: null,
        },
        select: {
          id: true,
          logo: true,
          brandColor: true,
          showQr: true,
          showThumbnails: true,
          showFooter: true,
        },
      });

    /*
     * Delete physical file.
     */
    if (
      company.logo &&
      company.logo.startsWith(
        "/uploads/"
      )
    ) {
      const relativePath =
        company.logo.replace(
          /^\/uploads\//,
          ""
        );

      const filePath = path.resolve(
        process.cwd(),
        "uploads",
        relativePath
      );

      const uploadsRoot = path.resolve(
        process.cwd(),
        "uploads"
      );

      /*
       * Security protection against
       * path traversal.
       */
      if (
        filePath.startsWith(
          uploadsRoot
        )
      ) {
        try {
          await fs.promises.unlink(
            filePath
          );
        } catch (deleteError) {
          if (
            deleteError.code !==
            "ENOENT"
          ) {
            console.error(
              "LOGO FILE DELETE ERROR:",
              deleteError
            );
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Logo removed successfully.",
      data: {
        branding: updatedCompany,
      },
    });
  } catch (error) {
    console.error(
      "DELETE LOGO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove logo.",
    });
  }
};

module.exports = {
  getSettings,
  getBranding,
  updateBranding,
  uploadLogo,
  deleteLogo,
};