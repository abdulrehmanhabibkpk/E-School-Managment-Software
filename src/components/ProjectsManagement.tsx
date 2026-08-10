import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderOpen,
  CheckSquare,
  X,
  Check,
  ChevronRight,
  Filter,
  Users,
  Search,
  Flag,
  MoreVertical,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectsManagementProps {
  subView?: "all" | "tasks";
  onBack: () => void;
}

interface Project {
  id: string;
  name: string;
  scope: string; // e.g. "Al-Noor Canal Campus", "Whole school"
  status: "Planning" | "Active" | "On hold" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate: string;
  tasksTotal: number;
  tasksDone: number;
  budget: number;
  spend: number;
  owner: string; // e.g. "School Owner", "Principal"
  details?: string;
}

interface TaskItem {
  id: string;
  projectId?: string;
  projectName?: string;
  title: string;
  status: "Pending" | "Completed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate: string;
}

const ProjectsManagement: React.FC<ProjectsManagementProps> = ({
  subView = "all",
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "tasks">(subView);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Notification banner state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  // Persistent Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("school_projects");
    if (saved) return JSON.parse(saved);

    // Default projects matching the screenshot exactly
    return [
      {
        id: "PRJ-001",
        name: "Block B roof repair",
        scope: "Al-Noor Canal Campus",
        status: "Active",
        priority: "Urgent",
        dueDate: "06-Aug-2026",
        tasksTotal: 5,
        tasksDone: 1,
        budget: 250000,
        spend: 126530,
        owner: "School Owner",
        details: "Critical repair work to resolve water leakage issue on the upper floor classrooms of Block B."
      },
      {
        id: "PRJ-002",
        name: "Annual safety inspection",
        scope: "Whole school",
        status: "Active",
        priority: "High",
        dueDate: "31-Aug-2026",
        tasksTotal: 3,
        tasksDone: 0,
        budget: 80000,
        spend: 0,
        owner: "School Owner",
        details: "Comprehensive checks of all fire escapes, laboratory emergency exits, play equipment, and electrical main boards."
      },
      {
        id: "PRJ-003",
        name: "Annual sports day",
        scope: "Al-Noor Canal Campus",
        status: "Completed",
        priority: "Medium",
        dueDate: "18-May-2026",
        tasksTotal: 3,
        tasksDone: 2,
        budget: 150000,
        spend: 0,
        owner: "School Owner",
        details: "Preparation of track and field, hiring of caterers and sound systems, printing medals and certificates."
      }
    ];
  });

  // Persistent Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem("school_project_tasks");
    if (saved) return JSON.parse(saved);

    return [
      {
        id: "TSK-001",
        projectId: "PRJ-001",
        projectName: "Block B roof repair",
        title: "Approve cement material quote",
        status: "Completed",
        priority: "Urgent",
        dueDate: "2026-08-05"
      },
      {
        id: "TSK-002",
        projectId: "PRJ-001",
        projectName: "Block B roof repair",
        title: "Begin concrete sealing process",
        status: "Pending",
        priority: "High",
        dueDate: "2026-08-12"
      },
      {
        id: "TSK-003",
        projectId: "PRJ-001",
        projectName: "Block B roof repair",
        title: "Post-sealing water leak test",
        status: "Pending",
        priority: "Medium",
        dueDate: "2026-08-15"
      },
      {
        id: "TSK-004",
        projectId: "PRJ-002",
        projectName: "Annual safety inspection",
        title: "Fire alarms battery replacement",
        status: "Pending",
        priority: "High",
        dueDate: "2026-08-20"
      },
      {
        id: "TSK-005",
        projectName: "General Admin",
        title: "Verify teacher license certifications",
        status: "Pending",
        priority: "Low",
        dueDate: "2026-08-18"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("school_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("school_project_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Form states for creating a project
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    scope: "Al-Noor Canal Campus",
    status: "Planning",
    priority: "Medium",
    dueDate: "",
    tasksTotal: 3,
    tasksDone: 0,
    budget: 100000,
    spend: 0,
    owner: "School Owner",
    details: ""
  });

  // Form states for adding a personal task
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [newTaskDate, setNewTaskDate] = useState("");

  const triggerNotification = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.dueDate) {
      alert("Please fill in the project title and due date.");
      return;
    }

    const created: Project = {
      id: `PRJ-${Date.now()}`,
      name: newProject.name,
      scope: newProject.scope || "Whole school",
      status: newProject.status as any || "Planning",
      priority: newProject.priority as any || "Medium",
      dueDate: formatDate(newProject.dueDate),
      tasksTotal: Number(newProject.tasksTotal) || 0,
      tasksDone: Number(newProject.tasksDone) || 0,
      budget: Number(newProject.budget) || 0,
      spend: Number(newProject.spend) || 0,
      owner: newProject.owner || "School Owner",
      details: newProject.details || ""
    };

    setProjects([...projects, created]);
    setShowAddProjectModal(false);
    setNewProject({
      name: "",
      scope: "Al-Noor Canal Campus",
      status: "Planning",
      priority: "Medium",
      dueDate: "",
      tasksTotal: 3,
      tasksDone: 0,
      budget: 100000,
      spend: 0,
      owner: "School Owner",
      details: ""
    });
    triggerNotification("Project created successfully!");
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setProjects(projects.map(p => p.id === selectedProject.id ? selectedProject : p));
    setShowEditProjectModal(false);
    setSelectedProject(null);
    triggerNotification("Project details updated!");
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter(p => p.id !== id));
      triggerNotification("Project deleted successfully.");
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newStatus = t.status === "Completed" ? "Pending" : "Completed";
        
        // Update corresponding project task counts if project matches
        if (t.projectId) {
          setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === t.projectId) {
              const delta = newStatus === "Completed" ? 1 : -1;
              const newDone = Math.max(0, Math.min(p.tasksTotal, p.tasksDone + delta));
              return { ...p, tasksDone: newDone };
            }
            return p;
          }));
        }
        
        return { ...t, status: newStatus };
      }
      return t;
    }));
    triggerNotification("Task status toggled!");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const matchedProject = projects.find(p => p.id === newTaskProject);

    const created: TaskItem = {
      id: `TSK-${Date.now()}`,
      projectId: newTaskProject || undefined,
      projectName: matchedProject ? matchedProject.name : "General Admin",
      title: newTaskTitle,
      status: "Pending",
      priority: newTaskPriority,
      dueDate: newTaskDate || new Date().toISOString().split("T")[0]
    };

    setTasks([created, ...tasks]);

    // Increase total tasks count in matching project
    if (newTaskProject) {
      setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === newTaskProject) {
          return { ...p, tasksTotal: p.tasksTotal + 1 };
        }
        return p;
      }));
    }

    setNewTaskTitle("");
    setNewTaskProject("");
    setNewTaskPriority("Medium");
    setNewTaskDate("");
    triggerNotification("New task assigned!");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        // e.g. "2026-08-06" -> "06-Aug-2026"
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parts[2];
        return `${day.padStart(2, "0")}-${months[monthIndex] || "Jan"}-${year}`;
      }
    }
    return dateStr;
  };

  // Filtering projects based on status pills and search query
  const filteredProjects = projects.filter(p => {
    const statusMatch = activeFilter === "All" || p.status.toLowerCase() === activeFilter.toLowerCase();
    const queryMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.details?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  const getStatusBadgeStyles = (status: Project["status"]) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "Planning":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "On hold":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Completed":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  const getPriorityBadgeStyles = (priority: Project["priority"]) => {
    switch (priority) {
      case "Urgent":
        return "bg-rose-50 text-rose-700 border border-rose-200/50 font-bold";
      case "High":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      case "Medium":
        return "bg-slate-100 text-slate-600 border border-slate-200/50";
      case "Low":
        return "bg-slate-50 text-slate-500 border border-slate-150";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-150";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#111827]">
      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 16, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 text-xs font-semibold"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Header Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-all text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <div className="h-6 w-px bg-slate-200" />
          
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Project Center</span>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              School Projects & Action board
            </h1>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>All Projects</span>
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "tasks"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>My Tasks</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ALL PROJECTS VIEW */}
          {activeTab === "all" && (
            <motion.div
              key="projects-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-7xl mx-auto"
            >
              {/* Toolbar Section */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-950">Projects</h2>
                    <div className="group relative">
                      <Info className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl z-20">
                        Work the school is running that isn't a class. Keep track of operations, events, and repairs.
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs font-medium">Work the school is running that isn't a class.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300 transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setShowAddProjectModal(true)}
                    className="w-full sm:w-auto bg-[#0F172A] hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </button>
                </div>
              </div>

              {/* Filtering Pill Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
                {["All", "Planning", "Active", "On hold", "Completed", "Cancelled"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      activeFilter === tab
                        ? "bg-white text-slate-950 border-slate-200 shadow-xs"
                        : "bg-transparent text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                  const tasksPercent = project.tasksTotal > 0 ? (project.tasksDone / project.tasksTotal) * 100 : 0;
                  const spendPercent = project.budget > 0 ? (project.spend / project.budget) * 100 : 0;

                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xs transition-shadow duration-200"
                    >
                      {/* Title and Edit Button */}
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {project.name}
                          </h3>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowEditProjectModal(true);
                            }}
                            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11.5px] text-slate-400 font-medium font-sans">
                          {project.scope}
                        </p>
                      </div>

                      {/* Status Pills and Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeStyles(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${getPriorityBadgeStyles(project.priority)}`}>
                          {project.priority}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10.5px] font-semibold ml-auto">
                          <Flag className="w-3 h-3 text-slate-400" />
                          <span>{project.dueDate}</span>
                        </div>
                      </div>

                      {/* Progress Progress Bars Container */}
                      <div className="space-y-4.5 mt-5">
                        {/* Tasks Indicator */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                            <span>Tasks</span>
                            <span className="text-slate-800">{project.tasksDone} / {project.tasksTotal} done</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#0F172A] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${tasksPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Spend Indicator */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                            <span>Spend</span>
                            <span className="text-slate-800">
                              Rs. {project.spend.toLocaleString()} of Rs. {project.budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, spendPercent)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Owner section */}
                      <div className="border-t border-slate-100 pt-3 mt-5 flex items-center justify-between text-[11px] font-medium text-slate-400">
                        <span>{project.owner}</span>
                        {project.details && (
                          <span className="text-[10px] text-slate-300 hover:text-slate-500 cursor-help" title={project.details}>
                            Details
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-medium">
                    <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold mb-1">No projects found</p>
                    <p className="text-xs text-slate-400">Create a new project to start tracking school operations.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: MY TASKS ACTION BOARD */}
          {activeTab === "tasks" && (
            <motion.div
              key="tasks-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            >
              {/* Task Creation & Assign Block (Left Side) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
                <div>
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Assign Action Task</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Quick-assign general tasks or match to projects</p>
                </div>

                <form onSubmit={handleAddTask} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Schedule laboratory audit"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Link to Project (Optional)</label>
                    <select
                      value={newTaskProject}
                      onChange={(e) => setNewTaskProject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="">General Administration Task</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.scope})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Due Date</label>
                      <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Action Task</span>
                  </button>
                </form>
              </div>

              {/* Tasks List Grid/Block (Right Side) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">My Task Board</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Interactive tasks checklist for school execution</p>
                  </div>
                  <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    {tasks.filter((t) => t.status === "Pending").length} Pending
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {tasks.map((task) => {
                    const isCompleted = task.status === "Completed";
                    return (
                      <div
                        key={task.id}
                        className={`py-3.5 flex items-start gap-3 transition-colors ${
                          isCompleted ? "opacity-60" : ""
                        }`}
                      >
                        {/* Checkbox button */}
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mt-0.5 ${
                            isCompleted
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "border-slate-300 hover:border-slate-400 bg-white"
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-4">
                            <span
                              className={`text-[12.5px] font-bold text-slate-800 ${
                                isCompleted ? "line-through text-slate-400" : ""
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadgeStyles(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-medium text-slate-400">
                            <span className="text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                              {task.projectName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              <span>Due {task.dueDate}</span>
                            </span>
                          </div>
                        </div>

                        {/* Quick Delete Task */}
                        <button
                          onClick={() => {
                            if (confirm("Delete this task?")) {
                              setTasks(tasks.filter((t) => t.id !== task.id));
                              triggerNotification("Task deleted");
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 p-1 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {tasks.length === 0 && (
                    <div className="py-12 text-center text-slate-400 font-medium">
                      <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-800 font-bold mb-1">Checklist empty</p>
                      <p className="text-xs text-slate-400">Assign a task to start organizing your schedule.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL 1: ADD NEW PROJECT */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Create New Project</h2>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Lab Equipment Upgrade"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Campus / Scope</label>
                  <input
                    type="text"
                    placeholder="e.g. Al-Noor Canal Campus"
                    value={newProject.scope}
                    onChange={(e) => setNewProject({ ...newProject, scope: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Target Due Date</label>
                  <input
                    type="date"
                    value={newProject.dueDate}
                    onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On hold">On hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Total Tasks</label>
                  <input
                    type="number"
                    value={newProject.tasksTotal}
                    onChange={(e) => setNewProject({ ...newProject, tasksTotal: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Tasks Completed</label>
                  <input
                    type="number"
                    value={newProject.tasksDone}
                    onChange={(e) => setNewProject({ ...newProject, tasksDone: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Budget (PKR)</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Spend (PKR)</label>
                  <input
                    type="number"
                    value={newProject.spend}
                    onChange={(e) => setNewProject({ ...newProject, spend: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Details & Remarks</label>
                <textarea
                  placeholder="Detailed project summary..."
                  value={newProject.details}
                  onChange={(e) => setNewProject({ ...newProject, details: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0F172A] hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: EDIT PROJECT */}
      {showEditProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Edit Project Details</h2>
              <button
                onClick={() => {
                  setShowEditProjectModal(false);
                  setSelectedProject(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Project Name</label>
                <input
                  type="text"
                  value={selectedProject.name}
                  onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Campus / Scope</label>
                  <input
                    type="text"
                    value={selectedProject.scope}
                    onChange={(e) => setSelectedProject({ ...selectedProject, scope: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Target Due Date</label>
                  <input
                    type="text"
                    value={selectedProject.dueDate}
                    onChange={(e) => setSelectedProject({ ...selectedProject, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Status</label>
                  <select
                    value={selectedProject.status}
                    onChange={(e) => setSelectedProject({ ...selectedProject, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On hold">On hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Priority</label>
                  <select
                    value={selectedProject.priority}
                    onChange={(e) => setSelectedProject({ ...selectedProject, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Total Tasks</label>
                  <input
                    type="number"
                    value={selectedProject.tasksTotal}
                    onChange={(e) => setSelectedProject({ ...selectedProject, tasksTotal: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Tasks Completed</label>
                  <input
                    type="number"
                    value={selectedProject.tasksDone}
                    onChange={(e) => setSelectedProject({ ...selectedProject, tasksDone: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Budget (PKR)</label>
                  <input
                    type="number"
                    value={selectedProject.budget}
                    onChange={(e) => setSelectedProject({ ...selectedProject, budget: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Spend (PKR)</label>
                  <input
                    type="number"
                    value={selectedProject.spend}
                    onChange={(e) => setSelectedProject({ ...selectedProject, spend: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Details & Remarks</label>
                <textarea
                  value={selectedProject.details || ""}
                  onChange={(e) => setSelectedProject({ ...selectedProject, details: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProject(selectedProject.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border border-red-200 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Project</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0F172A] hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;
