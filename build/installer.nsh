!ifndef MUI_BGCOLOR
  !define MUI_BGCOLOR "FFFFFF"
!endif
!ifndef MUI_TEXTCOLOR
  !define MUI_TEXTCOLOR "111217"
!endif
!ifndef MUI_DIRECTORYPAGE_BGCOLOR
  !define MUI_DIRECTORYPAGE_BGCOLOR "FFFFFF"
!endif
!ifndef MUI_DIRECTORYPAGE_TEXTCOLOR
  !define MUI_DIRECTORYPAGE_TEXTCOLOR "111217"
!endif
!ifndef MUI_INSTFILESPAGE_COLORS
  !define MUI_INSTFILESPAGE_COLORS "3257F7 FFFFFF"
!endif
!ifndef MUI_FINISHPAGE_LINK_COLOR
  !define MUI_FINISHPAGE_LINK_COLOR "3257F7"
!endif
!ifndef MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE
!endif
!ifndef MUI_HEADERIMAGE_BITMAP_STRETCH
  !define MUI_HEADERIMAGE_BITMAP_STRETCH "FitControl"
!endif
!ifndef MUI_HEADERIMAGE_UNBITMAP_STRETCH
  !define MUI_HEADERIMAGE_UNBITMAP_STRETCH "FitControl"
!endif
!ifndef BUILD_UNINSTALLER
  !ifndef MUI_CUSTOMFUNCTION_GUIINIT
    !define MUI_CUSTOMFUNCTION_GUIINIT FavoradioGuiInit
  !endif
!endif

!include LogicLib.nsh
!include FileFunc.nsh
!include StdUtils.nsh
!include nsDialogs.nsh
!include WinMessages.nsh

!ifndef FAVORADIO_INSTALL_DIR_NAME
  !define FAVORADIO_INSTALL_DIR_NAME "Favoradio"
!endif
!ifndef FAVORADIO_INSTALL_DIR_NAME_LOWER
  !define FAVORADIO_INSTALL_DIR_NAME_LOWER "favoradio"
!endif
!ifndef FAVORADIO_INSTALL_MARKER
  !define FAVORADIO_INSTALL_MARKER ".favoradio-install-root"
!endif
!ifndef FAVORADIO_MARKER_APP_ID
  !define FAVORADIO_MARKER_APP_ID "com.favoradio.desktop"
!endif
!ifndef FAVORADIO_INSTALL_BRAND
  !define FAVORADIO_INSTALL_BRAND "FAVORADIO"
!endif
!ifndef FAVORADIO_INSTALL_TITLE
  !define FAVORADIO_INSTALL_TITLE "Favoradio 安装"
!endif
!ifndef FAVORADIO_INSTALL_NOTICE
  !define FAVORADIO_INSTALL_NOTICE ""
!endif

!ifndef BUILD_UNINSTALLER
  Var FavoradioWelcomePage
  Var FavoradioHeroFont
  Var FavoradioTitleFont
  Var FavoradioBodyFont
  Var FavoradioSmallFont
  Var FavoradioDirectoryPage
  Var FavoradioDirectoryInput
!endif

!macro customInit
  !ifndef BUILD_UNINSTALLER
    Call FavoradioUsePreferredInstallDir
    Call FavoradioDisableUnsafeOldUninstallers
    ${If} ${Silent}
      Call FavoradioValidateInstallDir
    ${EndIf}
  !endif
!macroend

!macro customInstall
  FileOpen $0 "$INSTDIR\${FAVORADIO_INSTALL_MARKER}" w
  ${IfNot} ${Errors}
    FileWrite $0 "Favoradio install root$\r$\n"
    FileWrite $0 "appId=${FAVORADIO_MARKER_APP_ID}$\r$\n"
    FileClose $0
  ${EndIf}
!macroend

!macro customRemoveFiles
  Call un.FavoradioRemoveInstalledFiles
!macroend

!macro customWelcomePage
  Page custom FavoradioWelcomeShow
!macroend

!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

!macro customPageAfterChangeDir
  Page custom FavoradioDirectoryShow FavoradioDirectoryLeave
!macroend

!macro customFinishPage
  !ifndef HIDE_RUN_AFTER_FINISH
    Function FavoradioFinishStartApp
      ${If} ${isUpdated}
        StrCpy $1 "--updated"
      ${Else}
        StrCpy $1 ""
      ${EndIf}
      ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
    FunctionEnd

    !define MUI_FINISHPAGE_RUN
    !define MUI_FINISHPAGE_RUN_FUNCTION "FavoradioFinishStartApp"
  !endif
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW FavoradioTintCommonControls
  !insertmacro MUI_PAGE_FINISH
!macroend

!ifndef BUILD_UNINSTALLER
Function FavoradioGuiInit
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 20, *i 1, i 4) i .r0'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 19, *i 1, i 4) i .r0'
  Call FavoradioTintCommonControls
FunctionEnd

Function FavoradioTintCommonControls
  SetCtlColors $HWNDPARENT "111217" "FFFFFF"

  GetDlgItem $0 $HWNDPARENT 1
  ${If} $0 <> 0
    SetCtlColors $0 "111217" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 2
  ${If} $0 <> 0
    SetCtlColors $0 "111217" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 3
  ${If} $0 <> 0
    SetCtlColors $0 "111217" "FFFFFF"
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 1028
  ${If} $0 <> 0
    SetCtlColors $0 "4B5263" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 1256
  ${If} $0 <> 0
    SetCtlColors $0 "4B5263" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 1034
  ${If} $0 <> 0
    SetCtlColors $0 "" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 1035
  ${If} $0 <> 0
    SetCtlColors $0 "" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 1037
  ${If} $0 <> 0
    SetCtlColors $0 "111217" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 1038
  ${If} $0 <> 0
    SetCtlColors $0 "4B5263" "FFFFFF"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 1039
  ${If} $0 <> 0
    SetCtlColors $0 "" "FFFFFF"
  ${EndIf}

  FindWindow $0 "#32770" "" $HWNDPARENT
  ${If} $0 <> 0
    SetCtlColors $0 "111217" "FFFFFF"

    GetDlgItem $1 $0 1000
    ${If} $1 <> 0
      SetCtlColors $1 "111217" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1001
    ${If} $1 <> 0
      SetCtlColors $1 "111217" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1004
    ${If} $1 <> 0
      SetCtlColors $1 "3257F7" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1006
    ${If} $1 <> 0
      SetCtlColors $1 "4B5263" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1016
    ${If} $1 <> 0
      SetCtlColors $1 "4B5263" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1019
    ${If} $1 <> 0
      SetCtlColors $1 "111217" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1020
    ${If} $1 <> 0
      SetCtlColors $1 "4B5263" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1023
    ${If} $1 <> 0
      SetCtlColors $1 "4B5263" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1024
    ${If} $1 <> 0
      SetCtlColors $1 "4B5263" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1027
    ${If} $1 <> 0
      SetCtlColors $1 "111217" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1201
    ${If} $1 <> 0
      SetCtlColors $1 "111217" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1202
    ${If} $1 <> 0
      SetCtlColors $1 "4B5263" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1203
    ${If} $1 <> 0
      SetCtlColors $1 "111217" "FFFFFF"
    ${EndIf}
    GetDlgItem $1 $0 1204
    ${If} $1 <> 0
      SetCtlColors $1 "4B5263" "FFFFFF"
    ${EndIf}
  ${EndIf}
FunctionEnd

Function FavoradioUsePreferredInstallDir
  ${GetParameters} $R0
  ClearErrors
  ${GetOptions} $R0 "/D=" $R1
  ${IfNot} ${Errors}
  ${AndIf} $R1 != ""
    StrCpy $INSTDIR "$R1"
  ${Else}
    Call FavoradioUseRegisteredInstallDir
    Pop $R2
    ${If} $R2 != "1"
      Call FavoradioUseFirstAvailableInstallDir
    ${EndIf}
  ${EndIf}
  Push "$INSTDIR"
  Call FavoradioNormalizeInstallDir
  Pop $INSTDIR
FunctionEnd

!macro FavoradioSelectDrive LETTER
  Push "${LETTER}:\"
  Call FavoradioIsSupportedInstallDrive
  Pop $0
  ${If} $0 == "1"
    StrCpy $INSTDIR "${LETTER}:\${FAVORADIO_INSTALL_DIR_NAME}"
    Return
  ${EndIf}
!macroend

Function FavoradioUseFirstAvailableInstallDir
  !insertmacro FavoradioSelectDrive "C"
  !insertmacro FavoradioSelectDrive "D"
  !insertmacro FavoradioSelectDrive "E"
  !insertmacro FavoradioSelectDrive "F"
  !insertmacro FavoradioSelectDrive "G"
  !insertmacro FavoradioSelectDrive "H"
  !insertmacro FavoradioSelectDrive "I"
  !insertmacro FavoradioSelectDrive "J"
  !insertmacro FavoradioSelectDrive "K"
  !insertmacro FavoradioSelectDrive "L"
  !insertmacro FavoradioSelectDrive "M"
  !insertmacro FavoradioSelectDrive "N"
  !insertmacro FavoradioSelectDrive "O"
  !insertmacro FavoradioSelectDrive "P"
  !insertmacro FavoradioSelectDrive "Q"
  !insertmacro FavoradioSelectDrive "R"
  !insertmacro FavoradioSelectDrive "S"
  !insertmacro FavoradioSelectDrive "T"
  !insertmacro FavoradioSelectDrive "U"
  !insertmacro FavoradioSelectDrive "V"
  !insertmacro FavoradioSelectDrive "W"
  !insertmacro FavoradioSelectDrive "X"
  !insertmacro FavoradioSelectDrive "Y"
  !insertmacro FavoradioSelectDrive "Z"
  StrCpy $INSTDIR "C:\${FAVORADIO_INSTALL_DIR_NAME}"
FunctionEnd

Function FavoradioIsSupportedInstallDrive
  Exch $0
  Push $1
  Push $2
  Push $3
  Push $4
  StrCpy $1 "0"
  System::Call 'kernel32::GetDriveTypeW(w r0) i .r2'
  ${If} $2 == 2
  ${OrIf} $2 == 3
    ; Google Drive's streamed virtual disk reports FAT, even when Windows calls it fixed.
    System::Call 'kernel32::GetVolumeInformationW(w r0, p 0, i 0, p 0, p 0, p 0, t .r3, i ${NSIS_MAX_STRLEN}) i .r4'
    ${If} $4 != 0
    ${AndIf} $3 == "NTFS"
      StrCpy $1 "1"
    ${ElseIf} $4 != 0
    ${AndIf} $3 == "ReFS"
      StrCpy $1 "1"
    ${ElseIf} $4 != 0
    ${AndIf} $3 == "exFAT"
      StrCpy $1 "1"
    ${EndIf}
  ${EndIf}
  StrCpy $0 "$1"
  Pop $4
  Pop $3
  Pop $2
  Pop $1
  Exch $0
FunctionEnd

Function FavoradioNormalizeInstallDir
  Exch $0
  Push "$0"
  Call FavoradioTrimInstallDir
  Pop $0
  StrLen $4 "${FAVORADIO_INSTALL_DIR_NAME}"
  StrLen $1 "$0"
  ${If} $1 == 2
    StrCpy $2 "$0" 1 1
    ${If} $2 == ":"
      StrCpy $0 "$0\${FAVORADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${ElseIf} $1 == 3
    StrCpy $2 "$0" 1 1
    StrCpy $3 "$0" 1 2
    ${If} $2 == ":"
    ${AndIf} $3 == "\"
      StrCpy $0 "$0${FAVORADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${EndIf}

  StrLen $1 "$0"
  IntOp $5 $4 + 1
  StrCpy $2 "$0" $5 -$5
  ${If} $1 < $5
  ${OrIf} $2 != "\${FAVORADIO_INSTALL_DIR_NAME}"
  ${AndIf} $2 != "\${FAVORADIO_INSTALL_DIR_NAME_LOWER}"
    StrCpy $0 "$0\${FAVORADIO_INSTALL_DIR_NAME}"
  ${EndIf}
  Exch $0
FunctionEnd

Function FavoradioTrimInstallDir
  Exch $0

  trim:
    StrLen $1 "$0"
    ${If} $1 > 3
      StrCpy $2 "$0" 1 -1
      ${If} $2 == "\"
        StrCpy $0 "$0" -1
        Goto trim
      ${EndIf}
    ${EndIf}

  Exch $0
FunctionEnd

Function FavoradioInstallDirLooksOwned
  Exch $0
  StrCpy $1 "0"

  IfFileExists "$0\${FAVORADIO_INSTALL_MARKER}" 0 +2
    StrCpy $1 "1"

  StrCpy $0 "$1"
  Exch $0
FunctionEnd

Function FavoradioExistingInstallPathCanBeAdopted
  Exch $0
  StrCpy $1 "0"

  ${If} $0 == ""
    Goto done
  ${EndIf}

  Push "$0"
  Call FavoradioTrimInstallDir
  Pop $2
  ${If} $2 == ""
    Goto done
  ${EndIf}

  Push "$2"
  Call FavoradioNormalizeInstallDir
  Pop $3
  ${If} $2 != $3
    Goto done
  ${EndIf}

  StrCpy $4 "$2" 3
  Push "$4"
  Call FavoradioIsSupportedInstallDrive
  Pop $4
  ${If} $4 != "1"
    Goto done
  ${EndIf}

  IfFileExists "$2\*.*" 0 done
  IfFileExists "$2\${FAVORADIO_INSTALL_MARKER}" adopt 0
  IfFileExists "$2\${PRODUCT_FILENAME}.exe" adopt 0
  IfFileExists "$2\resources\app.asar" adopt 0
  IfFileExists "$2\resources\app\package.json" adopt 0
  IfFileExists "$2\resources\app\server.js" adopt 0
  Goto done

  adopt:
    StrCpy $1 "1"

  done:
    StrCpy $0 "$1"
    Exch $0
FunctionEnd

Function FavoradioUseRegisteredInstallDir
  ReadRegStr $0 HKCU "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FavoradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FavoradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  ReadRegStr $0 HKLM "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FavoradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FavoradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  Push "0"
FunctionEnd

Function FavoradioRegisteredInstallDirCanBeAdopted
  Exch $0
  StrCpy $1 "0"

  ${If} $0 == ""
    Goto done
  ${EndIf}

  Push "$0"
  Call FavoradioNormalizeInstallDir
  Pop $2

  ReadRegStr $3 HKCU "Software\${APP_GUID}" InstallLocation
  Push "$3"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FavoradioNormalizeInstallDir
    Pop $5
    ${If} $5 == $2
      StrCpy $1 "1"
      Goto done
    ${EndIf}
  ${EndIf}

  ReadRegStr $3 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$3"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FavoradioNormalizeInstallDir
    Pop $5
    ${If} $5 == $2
      StrCpy $1 "1"
      Goto done
    ${EndIf}
  ${EndIf}

  ReadRegStr $3 HKLM "Software\${APP_GUID}" InstallLocation
  Push "$3"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FavoradioNormalizeInstallDir
    Pop $5
    ${If} $5 == $2
      StrCpy $1 "1"
      Goto done
    ${EndIf}
  ${EndIf}

  ReadRegStr $3 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$3"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FavoradioNormalizeInstallDir
    Pop $5
    ${If} $5 == $2
      StrCpy $1 "1"
      Goto done
    ${EndIf}
  ${EndIf}

  done:
    StrCpy $0 "$1"
    Exch $0
FunctionEnd

Function FavoradioInstallDirIsEmpty
  Exch $0
  FindFirst $1 $2 "$0\*.*"
  StrCpy $3 "1"

  loop:
    StrCmp $2 "" done
    StrCmp $2 "." next
    StrCmp $2 ".." next
    StrCpy $3 "0"
    Goto done

  next:
    FindNext $1 $2
    Goto loop

  done:
    FindClose $1
    StrCpy $0 "$3"
    Exch $0
FunctionEnd

Function FavoradioOldInstallPathNeedsQuarantine
  Exch $0
  StrCpy $1 "0"

  ${If} $0 == ""
    Goto done
  ${EndIf}

  Push "$0"
  Call FavoradioTrimInstallDir
  Pop $2
  Push "$2"
  Call FavoradioNormalizeInstallDir
  Pop $3

  ${If} $2 != $3
    StrCpy $1 "1"
    Goto done
  ${EndIf}

  IfFileExists "$2\${FAVORADIO_INSTALL_MARKER}" done 0
  Push "$2"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Goto done
  ${EndIf}

  StrCpy $1 "1"

  done:
    StrCpy $0 "$1"
    Exch $0
FunctionEnd

Function FavoradioDisableUnsafeOldUninstallers
  StrCpy $2 "0"

  ReadRegStr $0 HKCU "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FavoradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FavoradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Favoradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FavoradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FavoradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Favoradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ${If} $2 == "1"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
    DeleteRegKey HKCU "Software\${APP_GUID}"
  ${EndIf}

  StrCpy $2 "0"

  ReadRegStr $0 HKLM "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FavoradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FavoradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Favoradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FavoradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FavoradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Favoradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ${If} $2 == "1"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
    DeleteRegKey HKLM "Software\${APP_GUID}"
  ${EndIf}
FunctionEnd

Function FavoradioDeleteLegacyUninstallerFileIfMissingMarker
  Pop $0
  Push $2
  ${If} $0 != ""
    Push "$0"
    Call FavoradioTrimInstallDir
    Pop $1
    ${If} $1 != ""
      StrCpy $2 "$1" 3
      Push "$2"
      Call FavoradioIsSupportedInstallDrive
      Pop $2
      ${If} $2 != "1"
        Goto done
      ${EndIf}
      IfFileExists "$1\${FAVORADIO_INSTALL_MARKER}" done 0
      DetailPrint "Remove legacy Favoradio uninstaller file: $1"
      Delete "$1\Uninstall ${PRODUCT_FILENAME}.exe"
    ${EndIf}
  ${EndIf}

  done:
    Pop $2
FunctionEnd

Function FavoradioValidateInstallDir
  Push "$INSTDIR"
  Call FavoradioNormalizeInstallDir
  Pop $INSTDIR

  StrCpy $0 "$INSTDIR" 3
  Push "$0"
  Call FavoradioIsSupportedInstallDrive
  Pop $0
  ${If} $0 != "1"
    MessageBox MB_ICONSTOP|MB_OK "请选择本机 NTFS、ReFS 或 exFAT 磁盘安装 Favoradio。Google Drive 等云端虚拟盘、网络盘和 FAT 盘不支持安装。$\r$\n$\r$\n当前路径：$INSTDIR"
    Abort
  ${EndIf}

  Push "$INSTDIR"
  Call FavoradioRegisteredInstallDirCanBeAdopted
  Pop $3

  Push "$INSTDIR"
  Call FavoradioExistingInstallPathCanBeAdopted
  Pop $4

  StrLen $0 "$INSTDIR"
  StrLen $2 "${FAVORADIO_INSTALL_DIR_NAME}"
  IntOp $2 $2 + 1
  StrCpy $1 "$INSTDIR" $2 -$2
  ${If} $0 < $2
  ${OrIf} $1 != "\${FAVORADIO_INSTALL_DIR_NAME}"
  ${AndIf} $1 != "\${FAVORADIO_INSTALL_DIR_NAME_LOWER}"
    MessageBox MB_ICONSTOP|MB_OK "安装目录必须是独立的 Favoradio 文件夹。请选择一个上级目录，安装器会自动创建 Favoradio 子文件夹。"
    Abort
  ${EndIf}

  IfFileExists "$INSTDIR\*.*" 0 valid

  Push "$INSTDIR"
  Call FavoradioInstallDirLooksOwned
  Pop $0
  ${If} $0 == "1"
    Goto valid
  ${EndIf}

  ${If} $3 == "1"
    Goto valid
  ${EndIf}

  ${If} $4 == "1"
    Goto valid
  ${EndIf}

  Push "$INSTDIR"
  Call FavoradioInstallDirIsEmpty
  Pop $0
  ${If} $0 == "1"
    Goto valid
  ${EndIf}

  MessageBox MB_ICONSTOP|MB_OK "为避免卸载时误删其它文件，Favoradio 不能安装到已有文件的非专属目录。请新建或选择一个空的 Favoradio 文件夹。$\r$\n$\r$\n当前路径：$INSTDIR"
  Abort

  valid:
FunctionEnd
Function FavoradioWelcomeShow
  Call FavoradioUsePreferredInstallDir

  nsDialogs::Create 1018
  Pop $FavoradioWelcomePage
  ${If} $FavoradioWelcomePage == error
    Abort
  ${EndIf}

  SetCtlColors $FavoradioWelcomePage "111217" "FFFFFF"
  CreateFont $FavoradioHeroFont "Microsoft YaHei UI" 24 700
  CreateFont $FavoradioTitleFont "Microsoft YaHei UI" 11 700
  CreateFont $FavoradioBodyFont "Microsoft YaHei UI" 9 400
  CreateFont $FavoradioSmallFont "Microsoft YaHei UI" 8 400

  ${NSD_CreateLabel} 22u 20u 120u 10u "${FAVORADIO_INSTALL_BRAND}"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioSmallFont 1
  SetCtlColors $0 "3257F7" "FFFFFF"

  ${NSD_CreateLabel} 22u 42u 226u 30u "${FAVORADIO_INSTALL_TITLE}"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioHeroFont 1
  SetCtlColors $0 "111217" "FFFFFF"

  ${NSD_CreateLabel} 22u 78u 36u 2u ""
  Pop $0
  SetCtlColors $0 "" "3257F7"

  ${NSD_CreateLabel} 22u 96u 238u 24u "为这台电脑安装 ${PRODUCT_NAME}。默认安装到 C:\${FAVORADIO_INSTALL_DIR_NAME}，下一步可以自由选择其它位置。"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioBodyFont 1
  SetCtlColors $0 "4B5263" "FFFFFF"

  ${NSD_CreateLabel} 22u 130u 238u 12u "默认位置：$INSTDIR"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioTitleFont 1
  SetCtlColors $0 "3257F7" "FFFFFF"

  !ifdef FAVORADIO_INTERNAL_BETA
    ${NSD_CreateLabel} 22u 150u 238u 28u "${FAVORADIO_INSTALL_NOTICE}"
    Pop $0
    SendMessage $0 ${WM_SETFONT} $FavoradioSmallFont 1
    SetCtlColors $0 "B42318" "FFFFFF"
  !endif

  nsDialogs::Show
FunctionEnd

Function FavoradioDirectoryBrowse
  nsDialogs::SelectFolderDialog "选择 ${PRODUCT_NAME} 安装文件夹" "$INSTDIR"
  Pop $0
  ${If} $0 != error
  ${AndIf} $0 != ""
    Push "$0"
    Call FavoradioNormalizeInstallDir
    Pop $0
    StrCpy $INSTDIR "$0"
    SendMessage $FavoradioDirectoryInput ${WM_SETTEXT} 0 "STR:$INSTDIR"
  ${EndIf}
FunctionEnd

Function FavoradioDirectoryShow
  Call FavoradioUsePreferredInstallDir

  nsDialogs::Create 1018
  Pop $FavoradioDirectoryPage
  ${If} $FavoradioDirectoryPage == error
    Abort
  ${EndIf}

  SetCtlColors $FavoradioDirectoryPage "111217" "FFFFFF"
  CreateFont $FavoradioTitleFont "Microsoft YaHei UI" 15 700
  CreateFont $FavoradioBodyFont "Microsoft YaHei UI" 9 400
  CreateFont $FavoradioSmallFont "Microsoft YaHei UI" 8 500

  ${NSD_CreateLabel} 22u 12u 238u 20u "选择安装位置"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioTitleFont 1
  SetCtlColors $0 "111217" "FFFFFF"

  ${NSD_CreateLabel} 22u 40u 238u 24u "你可以使用默认路径，也可以选择其它磁盘或文件夹。安装器会自动创建缺失的目录。"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioBodyFont 1
  SetCtlColors $0 "4B5263" "FFFFFF"

  ${NSD_CreateLabel} 22u 76u 238u 10u "安装目录"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioSmallFont 1
  SetCtlColors $0 "3257F7" "FFFFFF"

  ${NSD_CreateText} 22u 94u 178u 15u "$INSTDIR"
  Pop $FavoradioDirectoryInput
  SendMessage $FavoradioDirectoryInput ${WM_SETFONT} $FavoradioBodyFont 1
  SetCtlColors $FavoradioDirectoryInput "111217" "FFFFFF"

  ${NSD_CreateBrowseButton} 210u 93u 50u 17u "浏览..."
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioSmallFont 1
  ${NSD_OnClick} $0 FavoradioDirectoryBrowse

  ${NSD_CreateLabel} 22u 122u 238u 12u "默认推荐：C:\${FAVORADIO_INSTALL_DIR_NAME}；选盘符会自动建文件夹。"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FavoradioSmallFont 1
  SetCtlColors $0 "6B7280" "FFFFFF"

  nsDialogs::Show
FunctionEnd

Function FavoradioDirectoryLeave
  ${NSD_GetText} $FavoradioDirectoryInput $0
  ${If} $0 == ""
    MessageBox MB_ICONEXCLAMATION|MB_OK "请选择安装文件夹。"
    Abort
  ${EndIf}
  Push "$0"
  Call FavoradioNormalizeInstallDir
  Pop $0
  StrCpy $INSTDIR "$0"
  SendMessage $FavoradioDirectoryInput ${WM_SETTEXT} 0 "STR:$INSTDIR"
  Call FavoradioValidateInstallDir
FunctionEnd
!endif

!ifdef BUILD_UNINSTALLER
!macro customUnInit
  Call un.FavoradioValidateUninstallDir
!macroend

Function un.FavoradioInstallDirLooksOwned
  Exch $0
  StrCpy $1 "0"

  IfFileExists "$0\${FAVORADIO_INSTALL_MARKER}" 0 +2
    StrCpy $1 "1"

  StrCpy $0 "$1"
  Exch $0
FunctionEnd

Function un.FavoradioNormalizeInstallDir
  Exch $0
  Push "$0"
  Call un.FavoradioTrimInstallDir
  Pop $0
  StrLen $4 "${FAVORADIO_INSTALL_DIR_NAME}"
  StrLen $1 "$0"
  ${If} $1 == 2
    StrCpy $2 "$0" 1 1
    ${If} $2 == ":"
      StrCpy $0 "$0\${FAVORADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${ElseIf} $1 == 3
    StrCpy $2 "$0" 1 1
    StrCpy $3 "$0" 1 2
    ${If} $2 == ":"
    ${AndIf} $3 == "\"
      StrCpy $0 "$0${FAVORADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${EndIf}

  StrLen $1 "$0"
  IntOp $5 $4 + 1
  StrCpy $2 "$0" $5 -$5
  ${If} $1 < $5
  ${OrIf} $2 != "\${FAVORADIO_INSTALL_DIR_NAME}"
  ${AndIf} $2 != "\${FAVORADIO_INSTALL_DIR_NAME_LOWER}"
    StrCpy $0 "$0\${FAVORADIO_INSTALL_DIR_NAME}"
  ${EndIf}
  Exch $0
FunctionEnd

Function un.FavoradioTrimInstallDir
  Exch $0

  trim:
    StrLen $1 "$0"
    ${If} $1 > 3
      StrCpy $2 "$0" 1 -1
      ${If} $2 == "\"
        StrCpy $0 "$0" -1
        Goto trim
      ${EndIf}
    ${EndIf}

  Exch $0
FunctionEnd

Function un.FavoradioValidateUninstallDir
  Push "$INSTDIR"
  Call un.FavoradioTrimInstallDir
  Pop $0
  Push "$0"
  Call un.FavoradioNormalizeInstallDir
  Pop $1
  ${If} $0 != $1
    MessageBox MB_OK|MB_ICONSTOP "当前卸载路径不是 Favoradio 专属目录，已阻止卸载以避免误删其它文件。$\r$\n$\r$\n当前路径：$INSTDIR$\r$\n安全路径应为：$0"
    SetErrorLevel 2
    Quit
  ${EndIf}
  StrCpy $INSTDIR "$0"

  Push "$INSTDIR"
  Call un.FavoradioInstallDirLooksOwned
  Pop $0
  ${If} $0 != "1"
    MessageBox MB_OK|MB_ICONSTOP "无法确认当前目录属于 Favoradio，已阻止卸载以避免误删其它文件。$\r$\n$\r$\n当前路径：$INSTDIR"
    SetErrorLevel 2
    Quit
  ${EndIf}
FunctionEnd

Function un.FavoradioRemoveInstalledFiles
  SetOutPath $TEMP

  Delete "$INSTDIR\${PRODUCT_FILENAME}.exe"
  Delete "$INSTDIR\Uninstall ${PRODUCT_FILENAME}.exe"
  Delete "$INSTDIR\uninstallerIcon.ico"

  Delete "$INSTDIR\chrome_100_percent.pak"
  Delete "$INSTDIR\chrome_200_percent.pak"
  Delete "$INSTDIR\d3dcompiler_47.dll"
  Delete "$INSTDIR\dxcompiler.dll"
  Delete "$INSTDIR\dxil.dll"
  Delete "$INSTDIR\ffmpeg.dll"
  Delete "$INSTDIR\icudtl.dat"
  Delete "$INSTDIR\libEGL.dll"
  Delete "$INSTDIR\libGLESv2.dll"
  Delete "$INSTDIR\LICENSE.electron.txt"
  Delete "$INSTDIR\LICENSES.chromium.html"
  Delete "$INSTDIR\resources.pak"
  Delete "$INSTDIR\snapshot_blob.bin"
  Delete "$INSTDIR\v8_context_snapshot.bin"
  Delete "$INSTDIR\vk_swiftshader.dll"
  Delete "$INSTDIR\vk_swiftshader_icd.json"
  Delete "$INSTDIR\vulkan-1.dll"

  RMDir "$INSTDIR\locales"
  RMDir "$INSTDIR\resources"
  RMDir "$INSTDIR\swiftshader"

  RMDir "$INSTDIR"
FunctionEnd
!endif
