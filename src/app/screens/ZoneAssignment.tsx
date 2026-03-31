import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { users as initialUsers, type UserAccount, type ActivityLog } from '../data/farmData';
import { UserCog, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';

export function ZoneAssignment() {
  const { user: currentUser } = useAuth();
  const { zones, activityLogs, setActivityLogs } = useFarmData();
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [assignedZones, setAssignedZones] = useState<string[]>([]);

  // Only admins should access this page
  if (currentUser?.user_type !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSelectUser = (userAccount: UserAccount) => {
    setSelectedUser(userAccount);
    setAssignedZones(userAccount.assignedZones || []);
  };

  const handleZoneToggle = (zoneId: string) => {
    setAssignedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleSave = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map(u =>
      u.id === selectedUser.id
        ? { ...u, assignedZones }
        : u
    );

    // Create activity logs for changes
    const previousZones = selectedUser.assignedZones || [];
    const addedZones = assignedZones.filter(z => !previousZones.includes(z));
    const removedZones = previousZones.filter(z => !assignedZones.includes(z));

    const newLogs: ActivityLog[] = [];

    addedZones.forEach(zoneId => {
      const zone = zones.find(z => z.id === zoneId);
      if (zone) {
        newLogs.push({
          id: `al${Date.now()}-${zoneId}`,
          userId: currentUser.user_id,
          userName: currentUser.user_name,
          userRole: currentUser.user_type,
          action: 'Assign',
          targetType: 'Zone Assignment',
          targetId: zoneId,
          targetName: zone.name,
          zoneId: zone.id,
          zoneName: zone.name,
          changes: `Assigned to ${selectedUser.name}`,
          timestamp: 'Just now',
        });
      }
    });

    removedZones.forEach(zoneId => {
      const zone = zones.find(z => z.id === zoneId);
      if (zone) {
        newLogs.push({
          id: `al${Date.now()}-${zoneId}-remove`,
          userId: currentUser.user_id,
          userName: currentUser.user_name,
          userRole: currentUser.user_type,
          action: 'Update',
          targetType: 'Zone Assignment',
          targetId: zoneId,
          targetName: zone.name,
          zoneId: zone.id,
          zoneName: zone.name,
          changes: `Removed ${selectedUser.name} from zone`,
          timestamp: 'Just now',
        });
      }
    });

    setUsers(updatedUsers);
    setActivityLogs([...newLogs, ...activityLogs]);
    alert('Zone assignments updated successfully!');
  };

  const operators = users.filter(u => u.role === 'Operator');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zone Assignments</h1>
        <p className="text-gray-500 mt-1">Assign operators to zones they can manage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Operators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {operators.map((userAccount) => (
                <button
                  key={userAccount.id}
                  onClick={() => handleSelectUser(userAccount)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    selectedUser?.id === userAccount.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{userAccount.name}</p>
                      <p className="text-sm text-gray-500">{userAccount.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          userAccount.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userAccount.status}
                        </span>
                        {userAccount.assignedZones && userAccount.assignedZones.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {userAccount.assignedZones.length} zone{userAccount.assignedZones.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedUser?.id === userAccount.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zone Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Assign Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select zones that {selectedUser.name} can manage:
                </p>
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={assignedZones.includes(zone.id)}
                        onCheckedChange={() => handleZoneToggle(zone.id)}
                        id={`zone-${zone.id}`}
                      />
                      <label
                        htmlFor={`zone-${zone.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-medium">{zone.name}</p>
                        <p className="text-sm text-gray-500">{zone.cropType} • {zone.area}</p>
                      </label>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSave} className="w-full mt-4">
                  Save Zone Assignments
                </Button>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-12">
                Select an operator to assign zones
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
