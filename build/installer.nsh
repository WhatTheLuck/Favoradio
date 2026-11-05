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
    !define MUI_CUSTOMFUNCTION_GUIINIT FaveradioGuiInit
  !endif
!endif

!include LogicLib.nsh
!include FileFunc.nsh
!include StdUtils.nsh
!include nsDialogs.nsh
!include WinMessages.nsh

!ifndef FAVERADIO_INSTALL_DIR_NAME
  !define FAVERADIO_INSTALL_DIR_NAME "Faveradio"
!endif
!ifndef FAVERADIO_INSTALL_DIR_NAME_LOWER
  !define FAVERADIO_INSTALL_DIR_NAME_LOWER "faveradio"
!endif
!ifndef FAVERADIO_INSTALL_MARKER
  !define FAVERADIO_INSTALL_MARKER ".faveradio-install-root"
!endif
!ifndef FAVERADIO_MARKER_APP_ID
  !define FAVERADIO_MARKER_APP_ID "com.faveradio.desktop"
!endif
!ifndef FAVERADIO_INSTALL_BRAND
  !define FAVERADIO_INSTALL_BRAND "FAVERADIO"
!endif
!ifndef FAVERADIO_INSTALL_TITLE
  !define FAVERADIO_INSTALL_TITLE "Faveradio 安装"
!endif
!ifndef FAVERADIO_INSTALL_NOTICE
  !define FAVERADIO_INSTALL_NOTICE ""
!endif

!ifndef BUILD_UNINSTALLER
  Var FaveradioWelcomePage
  Var FaveradioHeroFont
  Var FaveradioTitleFont
  Var FaveradioBodyFont
  Var FaveradioSmallFont
  Var FaveradioDirectoryPage
  Var FaveradioDirectoryInput
!endif

!macro customInit
  !ifndef BUILD_UNINSTALLER
    Call FaveradioUsePreferredInstallDir
    Call FaveradioDisableUnsafeOldUninstallers
    ${If} ${Silent}
      Call FaveradioValidateInstallDir
    ${EndIf}
  !endif
!macroend

!macro customInstall
  FileOpen $0 "$INSTDIR\${FAVERADIO_INSTALL_MARKER}" w
  ${IfNot} ${Errors}
    FileWrite $0 "Faveradio install root$\r$\n"
    FileWrite $0 "appId=${FAVERADIO_MARKER_APP_ID}$\r$\n"
    FileClose $0
  ${EndIf}
!macroend

!macro customRemoveFiles
  Call un.FaveradioRemoveInstalledFiles
!macroend

!macro customWelcomePage
  Page custom FaveradioWelcomeShow
!macroend

!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

!macro customPageAfterChangeDir
  Page custom FaveradioDirectoryShow FaveradioDirectoryLeave
!macroend

!macro customFinishPage
  !ifndef HIDE_RUN_AFTER_FINISH
    Function FaveradioFinishStartApp
      ${If} ${isUpdated}
        StrCpy $1 "--updated"
      ${Else}
        StrCpy $1 ""
      ${EndIf}
      ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
    FunctionEnd

    !define MUI_FINISHPAGE_RUN
    !define MUI_FINISHPAGE_RUN_FUNCTION "FaveradioFinishStartApp"
  !endif
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW FaveradioTintCommonControls
  !insertmacro MUI_PAGE_FINISH
!macroend

!ifndef BUILD_UNINSTALLER
Function FaveradioGuiInit
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 20, *i 1, i 4) i .r0'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 19, *i 1, i 4) i .r0'
  Call FaveradioTintCommonControls
FunctionEnd

Function FaveradioTintCommonControls
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

Function FaveradioUsePreferredInstallDir
  ${GetParameters} $R0
  ClearErrors
  ${GetOptions} $R0 "/D=" $R1
  ${IfNot} ${Errors}
  ${AndIf} $R1 != ""
    StrCpy $INSTDIR "$R1"
  ${Else}
    Call FaveradioUseRegisteredInstallDir
    Pop $R2
    ${If} $R2 != "1"
      Call FaveradioUseFirstAvailableInstallDir
    ${EndIf}
  ${EndIf}
  Push "$INSTDIR"
  Call FaveradioNormalizeInstallDir
  Pop $INSTDIR
FunctionEnd

!macro FaveradioSelectDrive LETTER
  Push "${LETTER}:\"
  Call FaveradioIsSupportedInstallDrive
  Pop $0
  ${If} $0 == "1"
    StrCpy $INSTDIR "${LETTER}:\${FAVERADIO_INSTALL_DIR_NAME}"
    Return
  ${EndIf}
!macroend

Function FaveradioUseFirstAvailableInstallDir
  !insertmacro FaveradioSelectDrive "C"
  !insertmacro FaveradioSelectDrive "D"
  !insertmacro FaveradioSelectDrive "E"
  !insertmacro FaveradioSelectDrive "F"
  !insertmacro FaveradioSelectDrive "G"
  !insertmacro FaveradioSelectDrive "H"
  !insertmacro FaveradioSelectDrive "I"
  !insertmacro FaveradioSelectDrive "J"
  !insertmacro FaveradioSelectDrive "K"
  !insertmacro FaveradioSelectDrive "L"
  !insertmacro FaveradioSelectDrive "M"
  !insertmacro FaveradioSelectDrive "N"
  !insertmacro FaveradioSelectDrive "O"
  !insertmacro FaveradioSelectDrive "P"
  !insertmacro FaveradioSelectDrive "Q"
  !insertmacro FaveradioSelectDrive "R"
  !insertmacro FaveradioSelectDrive "S"
  !insertmacro FaveradioSelectDrive "T"
  !insertmacro FaveradioSelectDrive "U"
  !insertmacro FaveradioSelectDrive "V"
  !insertmacro FaveradioSelectDrive "W"
  !insertmacro FaveradioSelectDrive "X"
  !insertmacro FaveradioSelectDrive "Y"
  !insertmacro FaveradioSelectDrive "Z"
  StrCpy $INSTDIR "C:\${FAVERADIO_INSTALL_DIR_NAME}"
FunctionEnd

Function FaveradioIsSupportedInstallDrive
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

Function FaveradioNormalizeInstallDir
  Exch $0
  Push "$0"
  Call FaveradioTrimInstallDir
  Pop $0
  StrLen $4 "${FAVERADIO_INSTALL_DIR_NAME}"
  StrLen $1 "$0"
  ${If} $1 == 2
    StrCpy $2 "$0" 1 1
    ${If} $2 == ":"
      StrCpy $0 "$0\${FAVERADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${ElseIf} $1 == 3
    StrCpy $2 "$0" 1 1
    StrCpy $3 "$0" 1 2
    ${If} $2 == ":"
    ${AndIf} $3 == "\"
      StrCpy $0 "$0${FAVERADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${EndIf}

  StrLen $1 "$0"
  IntOp $5 $4 + 1
  StrCpy $2 "$0" $5 -$5
  ${If} $1 < $5
  ${OrIf} $2 != "\${FAVERADIO_INSTALL_DIR_NAME}"
  ${AndIf} $2 != "\${FAVERADIO_INSTALL_DIR_NAME_LOWER}"
    StrCpy $0 "$0\${FAVERADIO_INSTALL_DIR_NAME}"
  ${EndIf}
  Exch $0
FunctionEnd

Function FaveradioTrimInstallDir
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

Function FaveradioInstallDirLooksOwned
  Exch $0
  StrCpy $1 "0"

  IfFileExists "$0\${FAVERADIO_INSTALL_MARKER}" 0 +2
    StrCpy $1 "1"

  StrCpy $0 "$1"
  Exch $0
FunctionEnd

Function FaveradioExistingInstallPathCanBeAdopted
  Exch $0
  StrCpy $1 "0"

  ${If} $0 == ""
    Goto done
  ${EndIf}

  Push "$0"
  Call FaveradioTrimInstallDir
  Pop $2
  ${If} $2 == ""
    Goto done
  ${EndIf}

  Push "$2"
  Call FaveradioNormalizeInstallDir
  Pop $3
  ${If} $2 != $3
    Goto done
  ${EndIf}

  StrCpy $4 "$2" 3
  Push "$4"
  Call FaveradioIsSupportedInstallDrive
  Pop $4
  ${If} $4 != "1"
    Goto done
  ${EndIf}

  IfFileExists "$2\*.*" 0 done
  IfFileExists "$2\${FAVERADIO_INSTALL_MARKER}" adopt 0
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

Function FaveradioUseRegisteredInstallDir
  ReadRegStr $0 HKCU "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FaveradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FaveradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  ReadRegStr $0 HKLM "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FaveradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $1
  ${If} $1 == "1"
    Push "$0"
    Call FaveradioNormalizeInstallDir
    Pop $INSTDIR
    Push "1"
    Return
  ${EndIf}

  Push "0"
FunctionEnd

Function FaveradioRegisteredInstallDirCanBeAdopted
  Exch $0
  StrCpy $1 "0"

  ${If} $0 == ""
    Goto done
  ${EndIf}

  Push "$0"
  Call FaveradioNormalizeInstallDir
  Pop $2

  ReadRegStr $3 HKCU "Software\${APP_GUID}" InstallLocation
  Push "$3"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FaveradioNormalizeInstallDir
    Pop $5
    ${If} $5 == $2
      StrCpy $1 "1"
      Goto done
    ${EndIf}
  ${EndIf}

  ReadRegStr $3 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$3"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FaveradioNormalizeInstallDir
    Pop $5
    ${If} $5 == $2
      StrCpy $1 "1"
      Goto done
    ${EndIf}
  ${EndIf}

  ReadRegStr $3 HKLM "Software\${APP_GUID}" InstallLocation
  Push "$3"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FaveradioNormalizeInstallDir
    Pop $5
    ${If} $5 == $2
      StrCpy $1 "1"
      Goto done
    ${EndIf}
  ${EndIf}

  ReadRegStr $3 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$3"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Push "$3"
    Call FaveradioNormalizeInstallDir
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

Function FaveradioInstallDirIsEmpty
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

Function FaveradioOldInstallPathNeedsQuarantine
  Exch $0
  StrCpy $1 "0"

  ${If} $0 == ""
    Goto done
  ${EndIf}

  Push "$0"
  Call FaveradioTrimInstallDir
  Pop $2
  Push "$2"
  Call FaveradioNormalizeInstallDir
  Pop $3

  ${If} $2 != $3
    StrCpy $1 "1"
    Goto done
  ${EndIf}

  IfFileExists "$2\${FAVERADIO_INSTALL_MARKER}" done 0
  Push "$2"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $4
  ${If} $4 == "1"
    Goto done
  ${EndIf}

  StrCpy $1 "1"

  done:
    StrCpy $0 "$1"
    Exch $0
FunctionEnd

Function FaveradioDisableUnsafeOldUninstallers
  StrCpy $2 "0"

  ReadRegStr $0 HKCU "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FaveradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FaveradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Faveradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FaveradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FaveradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Faveradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ${If} $2 == "1"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
    DeleteRegKey HKCU "Software\${APP_GUID}"
  ${EndIf}

  StrCpy $2 "0"

  ReadRegStr $0 HKLM "Software\${APP_GUID}" InstallLocation
  Push "$0"
  Call FaveradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FaveradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Faveradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" InstallLocation
  Push "$0"
  Call FaveradioDeleteLegacyUninstallerFileIfMissingMarker
  Push "$0"
  Call FaveradioOldInstallPathNeedsQuarantine
  Pop $1
  ${If} $1 == "1"
    DetailPrint "Skip unsafe legacy Faveradio uninstaller: $0"
    StrCpy $2 "1"
  ${EndIf}

  ${If} $2 == "1"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
    DeleteRegKey HKLM "Software\${APP_GUID}"
  ${EndIf}
FunctionEnd

Function FaveradioDeleteLegacyUninstallerFileIfMissingMarker
  Pop $0
  Push $2
  ${If} $0 != ""
    Push "$0"
    Call FaveradioTrimInstallDir
    Pop $1
    ${If} $1 != ""
      StrCpy $2 "$1" 3
      Push "$2"
      Call FaveradioIsSupportedInstallDrive
      Pop $2
      ${If} $2 != "1"
        Goto done
      ${EndIf}
      IfFileExists "$1\${FAVERADIO_INSTALL_MARKER}" done 0
      DetailPrint "Remove legacy Faveradio uninstaller file: $1"
      Delete "$1\Uninstall ${PRODUCT_FILENAME}.exe"
    ${EndIf}
  ${EndIf}

  done:
    Pop $2
FunctionEnd

Function FaveradioValidateInstallDir
  Push "$INSTDIR"
  Call FaveradioNormalizeInstallDir
  Pop $INSTDIR

  StrCpy $0 "$INSTDIR" 3
  Push "$0"
  Call FaveradioIsSupportedInstallDrive
  Pop $0
  ${If} $0 != "1"
    MessageBox MB_ICONSTOP|MB_OK "请选择本机 NTFS、ReFS 或 exFAT 磁盘安装 Faveradio。Google Drive 等云端虚拟盘、网络盘和 FAT 盘不支持安装。$\r$\n$\r$\n当前路径：$INSTDIR"
    Abort
  ${EndIf}

  Push "$INSTDIR"
  Call FaveradioRegisteredInstallDirCanBeAdopted
  Pop $3

  Push "$INSTDIR"
  Call FaveradioExistingInstallPathCanBeAdopted
  Pop $4

  StrLen $0 "$INSTDIR"
  StrLen $2 "${FAVERADIO_INSTALL_DIR_NAME}"
  IntOp $2 $2 + 1
  StrCpy $1 "$INSTDIR" $2 -$2
  ${If} $0 < $2
  ${OrIf} $1 != "\${FAVERADIO_INSTALL_DIR_NAME}"
  ${AndIf} $1 != "\${FAVERADIO_INSTALL_DIR_NAME_LOWER}"
    MessageBox MB_ICONSTOP|MB_OK "安装目录必须是独立的 Faveradio 文件夹。请选择一个上级目录，安装器会自动创建 Faveradio 子文件夹。"
    Abort
  ${EndIf}

  IfFileExists "$INSTDIR\*.*" 0 valid

  Push "$INSTDIR"
  Call FaveradioInstallDirLooksOwned
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
  Call FaveradioInstallDirIsEmpty
  Pop $0
  ${If} $0 == "1"
    Goto valid
  ${EndIf}

  MessageBox MB_ICONSTOP|MB_OK "为避免卸载时误删其它文件，Faveradio 不能安装到已有文件的非专属目录。请新建或选择一个空的 Faveradio 文件夹。$\r$\n$\r$\n当前路径：$INSTDIR"
  Abort

  valid:
FunctionEnd
Function FaveradioWelcomeShow
  Call FaveradioUsePreferredInstallDir

  nsDialogs::Create 1018
  Pop $FaveradioWelcomePage
  ${If} $FaveradioWelcomePage == error
    Abort
  ${EndIf}

  SetCtlColors $FaveradioWelcomePage "111217" "FFFFFF"
  CreateFont $FaveradioHeroFont "Microsoft YaHei UI" 24 700
  CreateFont $FaveradioTitleFont "Microsoft YaHei UI" 11 700
  CreateFont $FaveradioBodyFont "Microsoft YaHei UI" 9 400
  CreateFont $FaveradioSmallFont "Microsoft YaHei UI" 8 400

  ${NSD_CreateLabel} 22u 20u 120u 10u "${FAVERADIO_INSTALL_BRAND}"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioSmallFont 1
  SetCtlColors $0 "3257F7" "FFFFFF"

  ${NSD_CreateLabel} 22u 42u 226u 30u "${FAVERADIO_INSTALL_TITLE}"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioHeroFont 1
  SetCtlColors $0 "111217" "FFFFFF"

  ${NSD_CreateLabel} 22u 78u 36u 2u ""
  Pop $0
  SetCtlColors $0 "" "3257F7"

  ${NSD_CreateLabel} 22u 96u 238u 24u "为这台电脑安装 ${PRODUCT_NAME}。默认安装到 C:\${FAVERADIO_INSTALL_DIR_NAME}，下一步可以自由选择其它位置。"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioBodyFont 1
  SetCtlColors $0 "4B5263" "FFFFFF"

  ${NSD_CreateLabel} 22u 130u 238u 12u "默认位置：$INSTDIR"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioTitleFont 1
  SetCtlColors $0 "3257F7" "FFFFFF"

  !ifdef FAVERADIO_INTERNAL_BETA
    ${NSD_CreateLabel} 22u 150u 238u 28u "${FAVERADIO_INSTALL_NOTICE}"
    Pop $0
    SendMessage $0 ${WM_SETFONT} $FaveradioSmallFont 1
    SetCtlColors $0 "B42318" "FFFFFF"
  !endif

  nsDialogs::Show
FunctionEnd

Function FaveradioDirectoryBrowse
  nsDialogs::SelectFolderDialog "选择 ${PRODUCT_NAME} 安装文件夹" "$INSTDIR"
  Pop $0
  ${If} $0 != error
  ${AndIf} $0 != ""
    Push "$0"
    Call FaveradioNormalizeInstallDir
    Pop $0
    StrCpy $INSTDIR "$0"
    SendMessage $FaveradioDirectoryInput ${WM_SETTEXT} 0 "STR:$INSTDIR"
  ${EndIf}
FunctionEnd

Function FaveradioDirectoryShow
  Call FaveradioUsePreferredInstallDir

  nsDialogs::Create 1018
  Pop $FaveradioDirectoryPage
  ${If} $FaveradioDirectoryPage == error
    Abort
  ${EndIf}

  SetCtlColors $FaveradioDirectoryPage "111217" "FFFFFF"
  CreateFont $FaveradioTitleFont "Microsoft YaHei UI" 15 700
  CreateFont $FaveradioBodyFont "Microsoft YaHei UI" 9 400
  CreateFont $FaveradioSmallFont "Microsoft YaHei UI" 8 500

  ${NSD_CreateLabel} 22u 12u 238u 20u "选择安装位置"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioTitleFont 1
  SetCtlColors $0 "111217" "FFFFFF"

  ${NSD_CreateLabel} 22u 40u 238u 24u "你可以使用默认路径，也可以选择其它磁盘或文件夹。安装器会自动创建缺失的目录。"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioBodyFont 1
  SetCtlColors $0 "4B5263" "FFFFFF"

  ${NSD_CreateLabel} 22u 76u 238u 10u "安装目录"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioSmallFont 1
  SetCtlColors $0 "3257F7" "FFFFFF"

  ${NSD_CreateText} 22u 94u 178u 15u "$INSTDIR"
  Pop $FaveradioDirectoryInput
  SendMessage $FaveradioDirectoryInput ${WM_SETFONT} $FaveradioBodyFont 1
  SetCtlColors $FaveradioDirectoryInput "111217" "FFFFFF"

  ${NSD_CreateBrowseButton} 210u 93u 50u 17u "浏览..."
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioSmallFont 1
  ${NSD_OnClick} $0 FaveradioDirectoryBrowse

  ${NSD_CreateLabel} 22u 122u 238u 12u "默认推荐：C:\${FAVERADIO_INSTALL_DIR_NAME}；选盘符会自动建文件夹。"
  Pop $0
  SendMessage $0 ${WM_SETFONT} $FaveradioSmallFont 1
  SetCtlColors $0 "6B7280" "FFFFFF"

  nsDialogs::Show
FunctionEnd

Function FaveradioDirectoryLeave
  ${NSD_GetText} $FaveradioDirectoryInput $0
  ${If} $0 == ""
    MessageBox MB_ICONEXCLAMATION|MB_OK "请选择安装文件夹。"
    Abort
  ${EndIf}
  Push "$0"
  Call FaveradioNormalizeInstallDir
  Pop $0
  StrCpy $INSTDIR "$0"
  SendMessage $FaveradioDirectoryInput ${WM_SETTEXT} 0 "STR:$INSTDIR"
  Call FaveradioValidateInstallDir
FunctionEnd
!endif

!ifdef BUILD_UNINSTALLER
!macro customUnInit
  Call un.FaveradioValidateUninstallDir
!macroend

Function un.FaveradioInstallDirLooksOwned
  Exch $0
  StrCpy $1 "0"

  IfFileExists "$0\${FAVERADIO_INSTALL_MARKER}" 0 +2
    StrCpy $1 "1"

  StrCpy $0 "$1"
  Exch $0
FunctionEnd

Function un.FaveradioNormalizeInstallDir
  Exch $0
  Push "$0"
  Call un.FaveradioTrimInstallDir
  Pop $0
  StrLen $4 "${FAVERADIO_INSTALL_DIR_NAME}"
  StrLen $1 "$0"
  ${If} $1 == 2
    StrCpy $2 "$0" 1 1
    ${If} $2 == ":"
      StrCpy $0 "$0\${FAVERADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${ElseIf} $1 == 3
    StrCpy $2 "$0" 1 1
    StrCpy $3 "$0" 1 2
    ${If} $2 == ":"
    ${AndIf} $3 == "\"
      StrCpy $0 "$0${FAVERADIO_INSTALL_DIR_NAME}"
    ${EndIf}
  ${EndIf}

  StrLen $1 "$0"
  IntOp $5 $4 + 1
  StrCpy $2 "$0" $5 -$5
  ${If} $1 < $5
  ${OrIf} $2 != "\${FAVERADIO_INSTALL_DIR_NAME}"
  ${AndIf} $2 != "\${FAVERADIO_INSTALL_DIR_NAME_LOWER}"
    StrCpy $0 "$0\${FAVERADIO_INSTALL_DIR_NAME}"
  ${EndIf}
  Exch $0
FunctionEnd

Function un.FaveradioTrimInstallDir
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

Function un.FaveradioValidateUninstallDir
  Push "$INSTDIR"
  Call un.FaveradioTrimInstallDir
  Pop $0
  Push "$0"
  Call un.FaveradioNormalizeInstallDir
  Pop $1
  ${If} $0 != $1
    MessageBox MB_OK|MB_ICONSTOP "当前卸载路径不是 Faveradio 专属目录，已阻止卸载以避免误删其它文件。$\r$\n$\r$\n当前路径：$INSTDIR$\r$\n安全路径应为：$0"
    SetErrorLevel 2
    Quit
  ${EndIf}
  StrCpy $INSTDIR "$0"

  Push "$INSTDIR"
  Call un.FaveradioInstallDirLooksOwned
  Pop $0
  ${If} $0 != "1"
    MessageBox MB_OK|MB_ICONSTOP "无法确认当前目录属于 Faveradio，已阻止卸载以避免误删其它文件。$\r$\n$\r$\n当前路径：$INSTDIR"
    SetErrorLevel 2
    Quit
  ${EndIf}
FunctionEnd

Function un.FaveradioRemoveInstalledFiles
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
