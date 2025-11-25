# Milestone Feature Implementation Guide

## ✅ Completed Steps

1. **Database Schema** - Created Milestone model in Prisma schema
2. **Database Migration** - Applied migration successfully
3. **API Routes** - Created `/api/milestones/route.ts` with full CRUD operations
4. **Frontend Interface** - Added Milestone TypeScript interface

## 🔄 Remaining Implementation

### Step 1: Add Milestone State Management

Add these state variables after the task management state in `src/app/client/projects/[id]/page.tsx`:

```typescript
// Milestone management state
const [milestones, setMilestones] = useState<Milestone[]>([]);
const [isMilestonesLoading, setIsMilestonesLoading] = useState(false);
const [showMilestoneModal, setShowMilestoneModal] = useState(false);
const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
const [milestoneFormData, setMilestoneFormData] = useState({
  title: "",
  description: "",
  amount: "",
  dueDate: "",
});
```

### Step 2: Add Milestone Fetch Effect

Add this useEffect after the tasks fetch effect:

```typescript
// Fetch milestones when Milestones tab is active
useEffect(() => {
  if (activeTab === "milestones" && project && !isMilestonesLoading && milestones.length === 0) {
    void fetchMilestones();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, project]);
```

### Step 3: Add Milestone Handler Functions

Add these functions after the task handlers:

```typescript
const fetchMilestones = async () => {
  try {
    setIsMilestonesLoading(true);
    const response = await fetch(`/api/milestones?projectId=${projectId}`);
    const data = await response.json() as { milestones: Milestone[] };
    setMilestones(data.milestones ?? []);
  } catch (error) {
    console.error("Error fetching milestones:", error);
  } finally {
    setIsMilestonesLoading(false);
  }
};

const handleCreateMilestone = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!milestoneFormData.title.trim() || !milestoneFormData.amount || !milestoneFormData.dueDate) {
    toast.error("Please fill in all required fields");
    return;
  }

  try {
    setIsSubmitting(true);

    const response = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title: milestoneFormData.title,
        description: milestoneFormData.description || null,
        amount: parseFloat(milestoneFormData.amount),
        dueDate: milestoneFormData.dueDate,
      }),
    });

    const data = await response.json() as { milestone: Milestone; error?: string };

    if (response.ok) {
      setMilestones([...milestones, data.milestone]);
      setShowMilestoneModal(false);
      setMilestoneFormData({ title: "", description: "", amount: "", dueDate: "" });
      toast.success("Milestone created successfully!");
    } else {
      toast.error(`Failed to create milestone: ${data.error ?? "Unknown error"}`);
    }
  } catch {
    toast.error("Error creating milestone. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

const handleEditMilestone = (milestone: Milestone) => {
  setEditingMilestone(milestone);
  setMilestoneFormData({
    title: milestone.title,
    description: milestone.description ?? "",
    amount: milestone.amount.toString(),
    dueDate: new Date(milestone.dueDate).toISOString().split('T')[0] ?? "",
  });
  setShowMilestoneModal(true);
};

const handleUpdateMilestone = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingMilestone || !milestoneFormData.title.trim()) return;

  try {
    setIsSubmitting(true);

    const response = await fetch("/api/milestones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        milestoneId: editingMilestone.id,
        title: milestoneFormData.title,
        description: milestoneFormData.description || null,
        amount: parseFloat(milestoneFormData.amount),
        dueDate: milestoneFormData.dueDate,
      }),
    });

    const data = await response.json() as { milestone: Milestone; error?: string };

    if (response.ok) {
      setMilestones(milestones.map(m => 
        m.id === editingMilestone.id ? data.milestone : m
      ));
      setShowMilestoneModal(false);
      setEditingMilestone(null);
      setMilestoneFormData({ title: "", description: "", amount: "", dueDate: "" });
      toast.success("Milestone updated successfully!");
    } else {
      toast.error(`Failed to update milestone: ${data.error ?? "Unknown error"}`);
    }
  } catch {
    toast.error("Error updating milestone. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

const handleDeleteMilestone = async (milestoneId: string) => {
  if (!confirm("Are you sure you want to delete this milestone?")) return;

  try {
    const response = await fetch(`/api/milestones?milestoneId=${milestoneId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setMilestones(milestones.filter(m => m.id !== milestoneId));
      toast.success("Milestone deleted successfully!");
    } else {
      toast.error("Failed to delete milestone");
    }
  } catch (error) {
    console.error("Error deleting milestone:", error);
    toast.error("Error deleting milestone. Please try again.");
  }
};

const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
  try {
    const response = await fetch("/api/milestones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId, status: newStatus }),
    });

    if (response.ok) {
      const data = await response.json() as { milestone: Milestone };
      setMilestones(milestones.map(m => 
        m.id === milestoneId ? data.milestone : m
      ));
      toast.success("Milestone status updated!");
    }
  } catch (error) {
    console.error("Error updating milestone status:", error);
  }
};

const handleCloseMilestoneModal = () => {
  setShowMilestoneModal(false);
  setEditingMilestone(null);
  setMilestoneFormData({ title: "", description: "", amount: "", dueDate: "" });
};

const getMilestoneStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "in_progress": return "bg-blue-100 text-blue-700 border-blue-300";
    case "completed": return "bg-green-100 text-green-700 border-green-300";
    default: return "bg-gray-100 text-gray-700 border-gray-300";
  }
};
```

### Step 4: Update the Milestones Tab UI

Replace the milestones tab content with this professional UI. The file is too large to show the complete replacement here, but the key changes are:

1. **Remove the static form** - Replace with modal-based creation
2. **Add dynamic milestone list** - Show actual milestones from database
3. **Add milestone cards** - Professional card design with status badges
4. **Add action buttons** - Edit, delete, and status change buttons
5. **Add milestone modal** - Similar to task modal for create/edit

### Step 5: Add Milestone Modal

Add this modal component before the closing `</main>` tag:

```tsx
{/* Milestone Creation/Edit Modal */}
{showMilestoneModal && (
  <div className="fixed inset-0 bg-black/15 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {editingMilestone ? "Edit Milestone" : "Create New Milestone"}
        </h3>
        <button
          onClick={handleCloseMilestoneModal}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Milestone Title *
          </label>
          <input
            type="text"
            value={milestoneFormData.title}
            onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
            placeholder="e.g., Design Phase Complete"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={milestoneFormData.description}
            onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
            placeholder="Describe what needs to be accomplished..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={milestoneFormData.amount}
              onChange={(e) => setMilestoneFormData({ ...milestoneFormData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={milestoneFormData.dueDate}
              onChange={(e) => setMilestoneFormData({ ...milestoneFormData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCloseMilestoneModal}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition border border-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (editingMilestone ? "Updating..." : "Creating...") 
              : (editingMilestone ? "Update Milestone" : "Create Milestone")
            }
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

## 📋 Summary

The milestone feature is now:
- ✅ Database schema created
- ✅ API routes implemented
- ✅ Frontend interface defined
- 📝 State management documented
- 📝 Handler functions documented
- 📝 UI components documented

## 🚀 Next Steps

1. Add the state management code
2. Add the handler functions
3. Update the milestones tab UI
4. Add the milestone modal
5. Test the complete feature

The implementation follows the same pattern as the task management feature for consistency.
