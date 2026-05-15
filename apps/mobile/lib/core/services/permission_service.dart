import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  static final PermissionService _instance = PermissionService._();
  factory PermissionService() => _instance;
  PermissionService._();

  bool _initialized = false;

  List<Permission> get requiredPermissions {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return [
        Permission.notification,
      ];
    }
    return [];
  }

  Future<void> ensureInitialized() async {
    if (_initialized) return;
    _initialized = true;
  }

  Future<Map<Permission, PermissionStatus>> requestAll() async {
    final perms = requiredPermissions;
    if (perms.isEmpty) return {};
    final results = <Permission, PermissionStatus>{};
    for (final p in perms) {
      final status = await p.request();
      results[p] = status;
    }
    return results;
  }

  Future<bool> areAllGranted() async {
    final perms = requiredPermissions;
    if (perms.isEmpty) return true;
    for (final p in perms) {
      if (!await p.isGranted) return false;
    }
    return true;
  }

  Future<bool> requestAndCheck() async {
    await requestAll();
    return areAllGranted();
  }

  Future<bool> isPermissionGranted(Permission permission) async {
    return permission.isGranted;
  }

  Future<bool> requestPermission(Permission permission) async {
    final status = await permission.request();
    return status.isGranted;
  }

  Future<bool> shouldShowRationale(Permission permission) async {
    return permission.shouldShowRequestRationale;
  }

  Future<bool> isPermanentlyDenied(Permission permission) async {
    return permission.isPermanentlyDenied;
  }

  Future<bool> openSettings() async {
    return openAppSettings();
  }
}
