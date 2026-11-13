// Hai hàm lấy nguyên từ trang builder Eco-Polis (ecopolis3d.netlify.app) để màu sắc và vị trí mô hình giống hệt bản gốc.
import * as THREE from 'three';
        function fixModelPivotAndMaterial(model) {
            // 1. Khử lỗi vật thể bị đen xì (như Pipe Ring) khi không có ảnh môi trường phản chiếu
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.forEach(mat => {
                        if (mat.metalness !== undefined && mat.metalness > 0.3) {
                            mat.metalness = 0.1;
                            mat.roughness = Math.max(mat.roughness || 0.5, 0.6);
                            mat.needsUpdate = true;
                        }
                    });
                }
            });

            // 2. Tính khung bao (Bounding Box) thực tế của vật thể
            model.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(model);
            if (box.isEmpty()) return;

            const center = new THREE.Vector3();
            box.getCenter(center);

            // Độ lệch giữa tâm hình khối thực tế và gốc tọa độ (0, 0, 0)
            // Trục X, Z lấy chính giữa vật; trục Y lấy đáy vật (box.min.y) để vật luôn đặt sát mặt đất
            const offset = new THREE.Vector3(center.x, box.min.y, center.z);

            // Nếu vật bị lệch tâm (như nhóm Pipe Ring), dịch chuyển toàn bộ các nhánh con về đúng tâm (0, 0, 0)
            if (offset.lengthSq() > 0.001) {
                model.children.forEach((child) => {
                    child.position.sub(offset);
                });
                model.updateMatrixWorld(true);
            }
        }
        // HÀM TỰ ĐỘNG TÔ MÀU KHI THIẾU TEXTURE (MỤC NATURE)
        // ==========================================
        // HÀM TỰ ĐỘNG TÔ MÀU CHUẨN XÁC THEO MẪU KENNEY (V2)
        // ==========================================
        function fixNatureColors(model, modelPath) {
            if (!modelPath) return;
            const pathLower = modelPath.toLowerCase();
            const fileName = pathLower.split('/').pop(); // Chỉ lấy tên file để tránh nhầm tên thư mục

            // Cập nhật ma trận để tính chính xác khung bao (Bounding Box)
            model.updateMatrixWorld(true);
            const totalBox = new THREE.Box3().setFromObject(model);
            const minY = totalBox.min.y;
            const maxY = totalBox.max.y;
            const totalHeight = Math.max(maxY - minY, 0.001);

            model.traverse((child) => {
                if (!child.isMesh) return;

                // 1. Nếu mô hình đã có sẵn ảnh texture hợp lệ thì chỉ khử lỗi đen kim loại rồi giữ nguyên
                if (child.material && child.material.map && child.material.map.image) {
                    child.material.metalness = 0.1;
                    child.material.roughness = 0.8;
                    return;
                }

                // 2. Nếu không nằm trong thư mục nature/ và vật liệu gốc đã có màu riêng (không phải trắng tinh) thì giữ nguyên màu gốc
                if (!pathLower.includes('nature/') && child.material && child.material.color) {
                    const c = child.material.color;
                    if (c.r < 0.95 || c.g < 0.95 || c.b < 0.95) {
                        child.material.metalness = 0.1;
                        child.material.roughness = 0.8;
                        return;
                    }
                }

                const geom = child.geometry.clone();
                if (!geom.attributes.normal) {
                    geom.computeVertexNormals();
                }
                child.geometry = geom;

                const pos = geom.attributes.position;
                const norm = geom.attributes.normal;
                const count = pos.count;
                const colors = new Float32Array(count * 3);

                const matName = (child.material && child.material.name ? child.material.name : '').toLowerCase();
                const meshName = (child.name || '').toLowerCase();
                const partInfo = `${matName} ${meshName}`;

                const vertex = new THREE.Vector3();
                const normal = new THREE.Vector3();
                const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld);
                const color = new THREE.Color();

                for (let i = 0; i < count; i++) {
                    vertex.fromBufferAttribute(pos, i);
                    const worldVertex = vertex.clone().applyMatrix4(child.matrixWorld);
                    const hRatio = Math.max(0, Math.min(1, (worldVertex.y - minY) / totalHeight));

                    normal.fromBufferAttribute(norm, i).applyMatrix3(normalMatrix).normalize();

                    // =========================================================
                    // TẦNG 1: ƯU TIÊN NHẬN DIỆN THEO TÊN MATERIAL TRONG FILE .GLB
                    // =========================================================
                    if (partInfo.includes('water') || partInfo.includes('river')) {
                        color.setHex(0x47C4FF); // Xanh nước biển sáng
                    } else if (partInfo.includes('woodbark') || partInfo.includes('bark') || partInfo.includes('trunk')) {
                        color.setHex(0xA86848); // Vỏ gỗ nâu cam
                    } else if (partInfo.includes('wood') || partInfo.includes('plank') || partInfo.includes('beige') || partInfo.includes('tan')) {
                        color.setHex(fileName.includes('stump') || fileName.includes('log') || fileName.includes('sign') ? 0xE2AA7E : 0xB87452); // Lõi gỗ vàng sáng / ván gỗ
                    } else if (partInfo.includes('leafsfall') || partInfo.includes('autumn') || partInfo.includes('orange')) {
                        color.setHex(hRatio > 0.6 ? 0xF39C12 : 0xD35400); // Lá mùa thu vàng cam
                    } else if (partInfo.includes('leafsdark') || partInfo.includes('greendark')) {
                        color.setHex(hRatio > 0.6 ? 0x2E7D32 : 0x1B5E20); // Lá xanh đậm
                    } else if (partInfo.includes('leafs') || partInfo.includes('foliage') || partInfo.includes('grass') || partInfo.includes('green')) {
                        color.setHex(fileName.includes('cliff') || fileName.includes('ground') || fileName.includes('platform') ? 0x43B581 : 0x4CAF50); // Cỏ xanh ngọc / Lá cây
                    } else if (partInfo.includes('tent') || partInfo.includes('red') || partInfo.includes('fabric')) {
                        color.setHex(0xE25345); // Đỏ cam (Lều, hoa đỏ, nấm đỏ)
                    } else if (partInfo.includes('yellow')) {
                        color.setHex(0xFDD835); // Vàng
                    } else if (partInfo.includes('purple')) {
                        color.setHex(0x8E24AA); // Tím
                    } else if (partInfo.includes('snow') || partInfo.includes('white')) {
                        color.setHex(0xF5F7FA); // Trắng tuyết
                    } else if (partInfo.includes('sand') || partInfo.includes('beach')) {
                        color.setHex(0xE8C193); // Vàng cát
                    } else if (partInfo.includes('dirt') || partInfo.includes('soil') || partInfo.includes('brown')) {
                        color.setHex(fileName.includes('crops') ? 0x6D4C41 : 0xC4724E); // Đất nâu / Nâu cam

                    // =========================================================
                    // TẦNG 2: PHÂN LOẠI CHI TIẾT THEO TÊN FILE & HÌNH HỌC 3D
                    // =========================================================

                    // 1. NHÓM VÁCH NÚI (cliff_*) - Phân biệt rõ _rock (Nâu cam) và _stone (Xám xanh)
                    } else if (fileName.includes('cliff')) {
                        const isStone = fileName.includes('_stone');
                        const hasGrassTop = fileName.includes('top') || fileName.includes('half') || fileName.includes('steps') || fileName.includes('block') || fileName.includes('cave');
                        const isWaterfall = fileName.includes('waterfall');

                        // Kiểm tra dòng thác chảy ở giữa
                        if (isWaterfall && Math.abs(vertex.x) < 0.22 && (normal.y > 0.4 || Math.abs(normal.z) > 0.4)) {
                            color.setHex(0x47C4FF); // Nước thác xanh dương sáng
                        }
                        // Kiểm tra lớp cỏ xanh ngọc trên mặt phẳng hướng lên (bậc thang, đỉnh vách, khối half)
                        else if (hasGrassTop && (
                            (fileName.includes('steps') && normal.y > 0.65 && hRatio > 0.12) ||
                            (fileName.includes('slope') && normal.y > 0.45 && hRatio > 0.25) ||
                            (!fileName.includes('steps') && !fileName.includes('slope') && (hRatio > 0.84 || (normal.y > 0.72 && hRatio > 0.68)))
                        )) {
                            color.setHex(0x43B581); // Cỏ xanh ngọc lục bảo chuẩn mẫu Kenney
                        }
                        // Màu thân vách đá
                        else if (isStone) {
                            color.setHex(normal.y > 0.2 ? 0xA6BCC6 : 0x8C9FA8); // Đá xám xanh băng
                        } else {
                            color.setHex(normal.y > 0.2 ? 0xC87652 : 0xB36240); // Đá nâu cam đất nung (_rock)
                        }
                    }

                    // 2. NHÓM LỀU TRẠI & TÚI NGỦ (tent_*, bed*)
                    else if (fileName.includes('tent') || fileName.startsWith('bed')) {
                        if (fileName.startsWith('bed')) {
                            color.setHex(hRatio > 0.65 ? 0xE8D8C0 : 0xE25345); // Túi ngủ đỏ cam, gối kem
                        } else if (hRatio < 0.08) {
                            color.setHex(0x8F5338); // Khung/cọc lều màu nâu gỗ
                        } else if (normal.y < -0.3) {
                            color.setHex(0x7A2820); // Mặt trong cửa lều tối màu
                        } else {
                            color.setHex(hRatio > 0.6 ? 0xEB6052 : 0xE25345); // Vải lều màu đỏ cam san hô
                        }
                    }

                    // 3. NHÓM TƯỢNG ĐÁ CỔ (statue_*)
                    else if (fileName.includes('statue')) {
                        color.setHex(hRatio > 0.25 && normal.y > -0.1 ? 0xA6BCC6 : 0x849CA7); // Xám xanh đá sáng
                    }

                    // 4. NHÓM GỐC CÂY (stump_*) & KHÚC GỖ (log*) - Tách 2 màu vỏ gỗ & mặt cắt lõi gỗ
                    else if (fileName.includes('stump')) {
                        if (normal.y > 0.72 && hRatio > 0.58) {
                            color.setHex(0xE2AA7E); // Mặt cắt ngang gốc cây màu vàng gỗ sáng
                        } else {
                            color.setHex(hRatio > 0.3 ? 0xA86848 : 0x8F5338); // Vỏ gốc cây màu nâu cam
                        }
                    } else if (fileName.startsWith('log')) {
                        if (Math.abs(normal.x) > 0.72 || (Math.abs(normal.z) > 0.72 && Math.abs(vertex.z) > 0.18)) {
                            color.setHex(0xE2AA7E); // Hai đầu mặt cắt khúc gỗ màu vàng sáng
                        } else {
                            color.setHex(normal.y > 0 ? 0xA86848 : 0x8F5338); // Vỏ khúc gỗ màu nâu cam
                        }
                    }

                    // 5. NHÓM HÀNG RÀO & BIỂN BÁO (fence_*, sign)
                    else if (fileName.includes('sign')) {
                        if (hRatio > 0.45 && Math.abs(normal.z) > 0.6) {
                            color.setHex(0xE2AA7E); // Mặt bảng gỗ sáng
                        } else {
                            color.setHex(0x965A3E); // Cọc và viền bảng nâu đậm
                        }
                    } else if (fileName.includes('fence')) {
                        if (hRatio > 0.32 && hRatio < 0.86 && Math.abs(normal.y) < 0.5) {
                            color.setHex(0xB87452); // Thanh ngang hàng rào nâu cam sáng
                        } else {
                            color.setHex(0x965A3E); // Trụ hàng rào nâu đậm
                        }
                    }

                    // 6. NHÓM CẦU, THUYỀN, LỬA TRẠI, CHẬU CÂY (bridge_*, canoe*, campfire_*, pot_*)
                    else if (fileName.includes('bridge')) {
                        if (fileName.includes('stone')) {
                            color.setHex(hRatio > 0.5 ? 0xA6BCC6 : 0x849CA7); // Cầu đá xám xanh
                        } else {
                            color.setHex(normal.y > 0.5 ? 0xC98860 : 0x965A3E); // Cầu gỗ nâu cam
                        }
                    } else if (fileName.includes('canoe')) {
                        if (fileName.includes('paddle')) {
                            color.setHex(0xD69A72); // Mái chèo gỗ sáng
                        } else {
                            color.setHex(hRatio > 0.65 ? 0xE2AA7E : 0xE25345); // Thuyền đỏ cam, viền gỗ sáng
                        }
                    } else if (fileName.includes('campfire')) {
                        const distCenter = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
                        if (hRatio > 0.42 && distCenter < 0.22) {
                            color.setHex(hRatio > 0.7 ? 0xFFB300 : 0xFF5722); // Ngọn lửa vàng cam
                        } else if (fileName.includes('stones') || fileName.includes('bricks')) {
                            color.setHex(distCenter > 0.2 ? 0x9EB4BE : 0x795548); // Vòng đá xám, củi nâu ở giữa
                        } else {
                            color.setHex(0x8F5338); // Củi gỗ nâu
                        }
                    } else if (fileName.startsWith('pot_')) {
                        color.setHex(hRatio > 0.75 ? 0xD4835E : 0xC4724E); // Chậu đất nung nâu cam
                    }

                    // 7. NHÓM ĐƯỜNG MÒN, SÔNG SUỐI, NỀN ĐẤT (ground_path*, ground_river*, path_*, platform_*)
                    else if (fileName.includes('ground_river')) {
                        if (hRatio > 0.78) {
                            color.setHex(0x43B581); // Bờ cỏ xanh ngọc
                        } else if (hRatio > 0.25 && normal.y > 0.3) {
                            color.setHex(0x47C4FF); // Lòng sông xanh nước biển
                        } else {
                            color.setHex(0xC4724E); // Đế đất nâu cam
                        }
                    } else if (fileName.includes('ground_path')) {
                        if (hRatio > 0.82) {
                            color.setHex(0x43B581); // Thảm cỏ xanh ngọc hai bên
                        } else if (hRatio > 0.35 && normal.y > 0.4) {
                            color.setHex(0xDFB18B); // Mặt đường mòn màu cát sáng
                        } else {
                            color.setHex(0xC4724E); // Đế đất nâu cam
                        }
                    } else if (fileName.startsWith('path_')) {
                        color.setHex(fileName.includes('stone') ? 0x9EB4BE : 0xB87452); // Đá lát xám xanh / Gỗ lát nâu
                    } else if (fileName.startsWith('platform_')) {
                        if (fileName.includes('stone')) {
                            color.setHex(0x9EB4BE);
                        } else if (fileName.includes('beach')) {
                            color.setHex(hRatio > 0.6 || normal.y > 0.6 ? 0xE8C193 : 0xC4724E); // Bãi cát vàng
                        } else {
                            color.setHex(hRatio > 0.6 || normal.y > 0.6 ? 0x43B581 : 0xC4724E); // Thềm cỏ xanh ngọc
                        }
                    }

                    // 8. NHÓM ĐÁ TẢNG & CỘT ĐÁ (rock_*, stone_*, rocks*)
                    else if (fileName.startsWith('rock_') || fileName.startsWith('rocks')) {
                        if (fileName.includes('top') && hRatio > 0.65 && normal.y > 0.5) {
                            color.setHex(0x43B581); // Đá có rêu/cỏ trên đỉnh (rock_smallTopA/B)
                        } else if (fileName.includes('sand')) {
                            color.setHex(hRatio > 0.4 ? 0xC4724E : 0xE8C193);
                        } else {
                            color.setHex(normal.y > 0.25 ? 0xC87652 : 0xB05E3C); // Đá tảng nâu cam chuẩn mẫu
                        }
                    } else if (fileName.startsWith('stone_')) {
                        color.setHex(normal.y > 0.25 ? 0xA6BCC6 : 0x8C9FA8); // Cột đá xám xanh (stone_tallA..J)
                    }

                    // 9. NHÓM CÂY CỐI (tree*, pine*, palm*)
                    else if (fileName.includes('tree') || fileName.includes('pine') || fileName.includes('palm')) {
                        const isFall = (fileName.includes('_fall') || fileName.includes('-fall')) && !fileName.includes('waterfall');
                        const isDark = fileName.includes('dark');
                        const isSnow = fileName.includes('snow');

                        if (hRatio < 0.30) {
                            color.setHex(0x8D5B4C); // Thân cây nâu gỗ
                        } else if (isSnow && normal.y > 0.45 && hRatio > 0.55) {
                            color.setHex(0xF5F7FA); // Tuyết phủ trên tán cây
                        } else if (isFall) {
                            color.setHex(hRatio > 0.65 ? 0xF5B041 : 0xDC7633); // Cam vàng mùa thu
                        } else if (isDark) {
                            color.setHex(hRatio > 0.65 ? 0x2E7D32 : 0x1B5E20); // Xanh lá đậm
                        } else {
                            color.setHex(hRatio > 0.65 ? 0x58D68D : 0x2ECC71); // Xanh lá tươi
                        }
                    }

                    // 10. NHÓM HOA, NẤM, NÔNG SẢN & THẢM THỰC VẬT
                    else if (fileName.includes('flower')) {
                        if (hRatio < 0.62) {
                            color.setHex(0x43B581); // Thân & lá xanh
                        } else if (fileName.includes('red')) {
                            color.setHex(0xE25345); // Hoa đỏ
                        } else if (fileName.includes('yellow')) {
                            color.setHex(0xFDD835); // Hoa vàng
                        } else if (fileName.includes('purple')) {
                            color.setHex(0x9B59B6); // Hoa tím
                        } else {
                            color.setHex(0xEC407A);
                        }
                    } else if (fileName.includes('mushroom')) {
                        if (hRatio < 0.52) {
                            color.setHex(0xF5CBA7); // Chân nấm màu kem
                        } else if (fileName.includes('red')) {
                            color.setHex(0xE25345); // Mũ nấm đỏ
                        } else {
                            color.setHex(0xD4AC0D); // Mũ nấm nâu vàng (tan)
                        }
                    } else if (fileName.includes('cactus')) {
                        color.setHex(0x2E7D32); // Xương rồng
                    } else if (fileName.includes('carrot') || fileName.includes('pumpkin')) {
                        color.setHex(hRatio > 0.7 ? 0x43B581 : 0xE67E22); // Củ cam, cuống xanh
                    } else if (fileName.includes('turnip')) {
                        color.setHex(hRatio > 0.62 ? 0x43B581 : 0xF5EEF8); // Củ cải trắng tím nhạt, lá xanh
                    } else if (fileName.includes('crops_corn') || fileName.includes('crops_wheat')) { // Dùng 'crops_corn' để KHÔNG trùng với 'corner'
                        color.setHex(hRatio > 0.48 ? 0xFBC02D : 0x7CB342); // Bắp / Lúa mì
                    } else if (fileName.includes('dirt')) {
                        color.setHex(0x6D4C41); // Luống đất trồng
                    } else {
                        color.setHex(hRatio > 0.5 ? 0x58D68D : 0x43B581); // Cỏ & bụi cây mặc định
                    }

                    colors[i * 3] = color.r;
                    colors[i * 3 + 1] = color.g;
                    colors[i * 3 + 2] = color.b;
                }

                geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                child.material = new THREE.MeshStandardMaterial({
                    vertexColors: true,
                    roughness: 0.82,
                    metalness: 0.05,
                    side: THREE.DoubleSide
                });
            });
        }
export { fixModelPivotAndMaterial, fixNatureColors };
