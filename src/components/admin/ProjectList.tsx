"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaRecycle, FaTrashRestore, FaStar } from "react-icons/fa";
import { LoadingSkeleton, EmptyState } from "@/components/ui/LoadingStates";
import { Button } from "@/components/ui/Button";

interface Project {
  docId: string;
  title: string;
  description: string;
  techStack: string;
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  order: number;
  featured: boolean;
  deleted?: boolean;
}

interface ProjectListProps {
  onEdit: (project: Project) => void;
  refreshTrigger: number;
}

export function ProjectList({ onEdit, refreshTrigger }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, "projects"));
        const list = snap.docs
          .map((d) => ({ docId: d.id, ...d.data() } as Project))
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        setProjects(list);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
        setLoading(false);
      }
    };
    fetchProjects();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await updateDoc(doc(db, "projects", id), { deleted: true, deletedAt: new Date().toISOString() });
      setProjects((prev) => prev.filter((p) => p.docId !== id));
      toast.success("Project moved to trash!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await updateDoc(doc(db, "projects", id), { deleted: false, deletedAt: null });
      setProjects((prev) => prev.filter((p) => p.docId !== id));
      toast.success("Project restored!");
    } catch (error) {
      console.error("Error restoring project:", error);
      toast.error("Failed to restore project");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("⚠️ This will permanently delete this project. Are you sure?")) return;
    const { deleteDoc } = await import("firebase/firestore");
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects((prev) => prev.filter((p) => p.docId !== id));
      toast.success("Project permanently deleted!");
    } catch (error) {
      console.error("Error permanently deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((p) =>
    showDeleted ? p.deleted === true : p.deleted !== true
  );

  const deletedCount = projects.filter((p) => p.deleted === true).length;

  if (loading) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  if (!showDeleted && projects.filter((p) => p.deleted !== true).length === 0) {
    return (
      <EmptyState
        emoji=""
        title="No projects yet"
        description='Click "Create New" to add your first project'
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowDeleted((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showDeleted
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-white/5 secondary-color-text opacity-60 hover:opacity-100 border border-white/10"
          }`}
        >
          {showDeleted ? <FaTrashRestore size={12} /> : <FaTrash size={12} />}
          {showDeleted ? "Active Items" : `Trash${deletedCount > 0 ? ` (${deletedCount})` : ""}`}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.docId}
            className={`group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all duration-200 border border-transparent hover:border-secondary-color-border ${
              project.deleted ? "opacity-60" : ""
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={project.imageUrl || "/placeholder.png"}
                alt={project.title}
                fill
                quality={90}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {project.deleted && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 text-white rounded text-xs font-semibold">
                  Deleted
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                {!project.deleted ? (
                  <>
                    <Button variant="ghost" onClick={() => onEdit(project)} icon={<FaEdit size={14} />}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(project.docId)} icon={<FaTrash size={14} />}>
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => handleRestore(project.docId)} icon={<FaRecycle size={14} />}>
                      Restore
                    </Button>
                    <Button variant="danger" onClick={() => handlePermanentDelete(project.docId)} icon={<FaTrash size={14} />}>
                      Delete Forever
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`secondary-color-text font-semibold font-heading text-lg line-clamp-1 flex-1 ${
                  project.deleted ? "line-through opacity-50" : ""
                }`}>
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 ml-2">
                  {project.featured && (
                    <FaStar size={12} className="text-amber-400" />
                  )}
                  <span className="text-xs secondary-color-text opacity-40">#{project.order}</span>
                </div>
              </div>
              <p className="secondary-color-text opacity-70 text-sm line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="secondary-color-text opacity-60 text-sm mt-6 text-center">
        {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
      </p>
    </div>
  );
}
