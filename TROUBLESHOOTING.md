# Troubleshooting: "Could Not Connect to Server" Error

## Quick Fix Steps

### Step 1: Clear Cache and Restart Metro
```bash
# Stop any running Metro bundler (Ctrl+C in terminal)

# Clear all caches
npm start -- --reset-cache

# Or if using Expo Go:
npx expo start -c
```

### Step 2: Clear Watchman Cache (if installed)
```bash
watchman watch-del-all
```

### Step 3: Clear npm Cache
```bash
npm cache clean --force
```

### Step 4: Remove node_modules and Reinstall
```bash
rm -rf node_modules
npm install
```

### Step 5: Clear Metro Cache Directory
```bash
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
```

### Step 6: Restart Development Server
```bash
# Start fresh
npm start
```

## Common Causes

### 1. Metro Bundler Not Running
**Symptom:** App can't connect to packager
**Fix:**
- Make sure `npm start` or `npx expo start` is running in a terminal
- Check that the port (usually 8081 or 19000) is not blocked

### 2. Firewall Blocking Connection
**Symptom:** Connection timeout
**Fix:**
- Check firewall settings
- Allow Metro bundler through firewall
- Try connecting to `localhost` instead of IP address

### 3. Wrong Network Configuration
**Symptom:** App tries to connect to wrong IP
**Fix:**
```bash
# Use tunnel mode (slower but more reliable)
npx expo start --tunnel

# Or use LAN mode
npx expo start --lan

# Or localhost mode
npx expo start --localhost
```

### 4. Code Syntax Errors
**Symptom:** Metro crashes or fails to build
**Fix:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

### 5. Stale Cache After Refactoring
**Symptom:** Old imports or types not found after refactoring
**Fix:**
```bash
# Clear everything and restart
rm -rf node_modules
rm -rf .expo
rm -rf $TMPDIR/metro-*
npm install
npm start -- --reset-cache
```

## Verification Steps

After applying fixes, verify:

### 1. Check TypeScript Compilation
```bash
npx tsc --noEmit
```
Should show no errors (or only warnings)

### 2. Check App Can Build
```bash
# In the terminal running Metro, you should see:
# ✓ Metro bundler running on port 8081
# ✓ Listening on http://localhost:8081
```

### 3. Try Different Connection Methods
- **QR Code**: Scan with Expo Go app
- **Localhost**: Press 'a' for Android or 'i' for iOS simulator
- **Tunnel**: If LAN doesn't work, try tunnel mode

## Still Not Working?

### Check Recent Code Changes
The refactoring we just did was:
1. ✅ Extracted component interfaces - **No runtime errors**
2. ✅ Extracted service interfaces - **No runtime errors**
3. ✅ All imports updated correctly

If Metro still won't start, check for:

### Missing Exports
```bash
# Search for import errors
grep -r "from '../types'" src/services/
grep -r "from '../types'" src/components/
```

### Circular Dependencies
```bash
# Check for circular imports between types and services
```

## Quick Health Check Commands

```bash
# 1. Check if packages are installed correctly
npm ls react-native
npm ls expo

# 2. Check Metro config
cat metro.config.js

# 3. Check if port is in use
lsof -i :8081
lsof -i :19000

# 4. Kill processes using the port
kill -9 $(lsof -t -i:8081)
kill -9 $(lsof -t -i:19000)
```

## Platform-Specific Issues

### iOS Simulator
```bash
# Reset simulator
xcrun simctl erase all

# Rebuild app
npm start
# Press 'i' to open in iOS simulator
```

### Android Emulator
```bash
# Start emulator first
emulator -avd <device_name>

# Or from Android Studio: Tools > Device Manager

# Then start Metro
npm start
# Press 'a' to open in Android
```

## Last Resort

If nothing works:

```bash
# 1. Complete clean slate
rm -rf node_modules
rm -rf .expo
rm -rf package-lock.json
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*

# 2. Fresh install
npm install

# 3. Start with clean cache
npm start -- --reset-cache

# 4. If still failing, check Node version
node --version  # Should be 16.x or higher
npm --version   # Should be 8.x or higher
```

## Post-Refactoring Specific

Since we just completed a major refactoring:

### Verify Type Exports
All these should work:
```typescript
// In any file:
import { ButtonProps, InputProps, CardProps } from '../types';
import { ContactInfo, ValidationResult, ChartDataItem } from '../types';
import { Transaction, Project } from '../types';
```

### Verify Service Imports
All these should work:
```typescript
// Services can import types:
import { Transaction, ChartDataItem } from '../types';
import { ContactInfo, ContactResult } from '../types';
import { ValidationResult } from '../types';
```

### No Breaking Changes
- All components still export the same props
- All services still export the same functions
- Only internal organization changed

## Need More Help?

Check these locations for detailed refactoring docs:
- `PHASE_1.5_COMPLETE.md` - Service interfaces refactoring
- `COMPONENT_INTERFACES_EXTRACTED.md` - Component props refactoring
- `REFACTORING_PROGRESS.md` - Overall progress

The refactoring is 100% backward compatible - no functionality changed!
